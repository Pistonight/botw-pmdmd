#include <exl/lib.hpp>
#include <nn/fs.h>

#include "screen.hpp"
#include "server.hpp"
#include "worker.hpp"

extern "C" void exl_main(void* x0, void* x1) {
    /* megaton_module_init(); */
    exl::hook::Initialize();

    /* nn::fs::MountSdCardForDebug("sd"); */

    botw::pmdmd::server_patch();
    botw::pmdmd::screen_init();
#ifdef BOTW_V160
    // tell server ready to init since there's no screen init
    botw::pmdmd::server_ready_to_init();
#endif
    botw::pmdmd::start_worker_thread();
}

extern "C" NORETURN void exl_exception_entry() {
    /* TODO: exception handling */
    EXL_ABORT(0x420);
}

