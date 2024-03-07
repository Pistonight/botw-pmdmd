#pragma once

#include <exl/types.h>

#include "critical_section.hpp"

namespace botw::pmdmd {

/// Patch the original socket stuff in the game
/// so we can use it
void server_patch();

void server_ready_to_init();

/// TCP Server for a single client
class Server {
public:
    /// Start the server loop
    void start(u16 port);

    /// Send dump data to the client
    void send_dump();

private:
    u16 port = 0;
    s32 server_socket = -1;
    s32 client_socket = -1;

    CriticalSection send_cs;
};

Server* server_instance();
void set_server_instance(Server*);
s32 server_debug_status();

}  // namespace botw::pmdmd
