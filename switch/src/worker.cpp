#include <nn/os.h>
#include <nn/time.h>

#include "mem.h"

#include "worker.hpp"
#include "server.hpp"

namespace botw::pmdmd {

static nn::os::ThreadType s_thread;
/* constexpr const size_t s_stack_size = 0x80000; */
/* static char s_stack[s_stack_size]; */

/* static void main_exec() { */
/*     PmdmDump dump; */
/*     dump.dump(); */
/*     dump.write_to_sd(); */
/* } */

void worker_main(void* arg) {
    /* info("Worker thread started"); */

    /* nn::TimeSpan shortWait = nn::TimeSpan::FromNanoSeconds(100000000);  // 3f */
    /* nn::TimeSpan longWait = nn::TimeSpan::FromSeconds(5); */

    /* Worker worker; */
    /* if (!worker.Init()) { */
    /*     error("Worker init failed"); */
    /* } */
    Server server;
    set_server_instance(&server);

    server.start(5001);


    /* info("Worker thread stopping"); */
}

void start_worker_thread() {
    const size_t s_stack_size = 0x80000;
    void* s_stack = memalign(0x1000, s_stack_size);

    // TODO: fix thread name
    /* s_thread._threadNameBuffer[0] = 'b'; */
    /* s_thread._threadNameBuffer[1] = '\0'; */
    nn::Result result =
        nn::os::CreateThread(
            &s_thread, worker_main, nullptr, s_stack, s_stack_size, 16);
    if (result.IsFailure()) {
        return;
    }
    nn::os::StartThread(&s_thread);
}

}  // namespace botwsavs::core

