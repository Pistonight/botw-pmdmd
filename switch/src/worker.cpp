#include <nn/os.h>
#include <nn/time.h>

#include "mem.h"

#include "worker.hpp"
#include "server.hpp"

namespace botw::pmdmd {

static nn::os::ThreadType s_thread;

void worker_main(void* arg) {
    Server server;
    set_server_instance(&server);
    
    server.start(5001);
}

void start_worker_thread() {
    const size_t s_stack_size = 0x80000;
    void* s_stack = memalign(0x1000, s_stack_size);

    nn::Result result =
        nn::os::CreateThread(
            &s_thread, worker_main, nullptr, s_stack, s_stack_size, 16);
    if (result.IsFailure()) {
        return;
    }
    nn::os::StartThread(&s_thread);
}

}  // namespace botwsavs::core

