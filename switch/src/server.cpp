#include <exl/lib.hpp>
#include <netinet/in.h>
#include <nn/nifm.h>
#include <nn/socket.h>
#include <prim/seadScopedLock.h>

#include "mem.h"
#include "nn/os.h"
#include "pmdm_dump.hpp"
#include "server.hpp"

namespace botw::pmdmd {

namespace inst = exl::armv8::inst;
namespace reg = exl::armv8::reg;

constexpr const size_t SOCKET_POOL_SIZE = 0x100000;
constexpr const size_t SOCKET_BUFFER_SIZE = 0x20000;

static s32 debug_status = -1;
static Server* s_instance = nullptr;
static volatile bool ready = false;

Server* server_instance() {
    return s_instance;
}

void set_server_instance(Server* server) {
    s_instance = server;
}

void server_ready_to_init() {
    ready = true;
}

s32 server_debug_status() {
    return debug_status;
}

void server_patch() {
    // Don't initialize PosTrackerUploader
    exl::patch::CodePatcher patcher { 0x00a8d070 };
    for (int i = 0; i < 23; i ++) {
        patcher.WriteInst(inst::Nop());
    }
}

void Server::start(u16 port) {
    while (!ready) {
        nn::os::SleepThread(nn::TimeSpan::FromSeconds(1));
        nn::os::YieldThread();
    }
    nn::Result result;
    // initialize network interface module
    result = nn::nifm::Initialize();
    if (result.IsFailure()) {
        debug_status = -2;
        return;
    }
    debug_status = 1;
    
    void* pool = memalign(0x1000, SOCKET_POOL_SIZE);
    result = nn::socket::Initialize(pool, SOCKET_POOL_SIZE, SOCKET_BUFFER_SIZE, 0x4);
    if (result.IsFailure()) {
        debug_status = -3;
        return;
    }
    
    nn::nifm::SubmitNetworkRequest();
    while (nn::nifm::IsNetworkRequestOnHold()) { }
    debug_status = 2;
    
    if (!nn::nifm::IsNetworkAvailable()) {
        debug_status = -4;
        return;
    }
    debug_status = 3;
    
    // initialize server socket
    server_socket = nn::socket::Socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0);
    if (server_socket < 0) {
        debug_status = -5;
        return;
    }
    debug_status = 4;
    
    // bind server socket
    sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = nn::socket::InetHtons(port);
    debug_status = 5;
    nn::socket::InetAton("0.0.0.0", reinterpret_cast<nn::socket::InAddr*>(&server_addr.sin_addr.s_addr));
    debug_status = 6;
    if (nn::socket::Bind(server_socket, reinterpret_cast<sockaddr*>(&server_addr), sizeof(server_addr)) < 0) {
        debug_status = -6;
        return;
    }
    debug_status = 7;
    
    if (nn::socket::Listen(server_socket, 1) < 0) {
        debug_status = -7;
        return;
    }
    
    // init ok
    debug_status = 8;
    
    
    // accept client
    while (true) {
        nn::os::YieldThread();
        debug_status = 9;
        client_socket = nn::socket::Accept(server_socket, nullptr, nullptr);
        if (client_socket < 0) {
            debug_status = -8;
            continue;
        }
    
        debug_status = 0;
        send_dump();
        // TODO: maybe wait for client and send command here
    
        nn::socket::Close(client_socket);
        client_socket = -1;
    
    }

}

void Server::send_dump() {
    PmdmDump dump;
    dump.dump();
    {
        sead::ScopedLock<sead::CriticalSection> lock(&send_cs);
        u8* data = reinterpret_cast<u8*>(&dump);
        size_t remaining = sizeof(PmdmDump);
        while (remaining > 0) {
            const size_t sent = nn::socket::Send(client_socket, data, remaining, 0);
            if (sent < 0) {
                return;
            }
            data += sent;
            remaining -= sent;
        }
    }
}

}
