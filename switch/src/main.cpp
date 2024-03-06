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
    botw::pmdmd::start_worker_thread();
}

/* constexpr const char* MEGATON_PANIC_FILE = "sd:/megaton-panic.txt"; */
/*  */
/* extern "C" NORETURN void megaton_panic_impl(const char* msg) { */
/*     nn::fs::DirectoryEntryType type; */
/*     nn::Result result = nn::fs::GetEntryType(&type, MEGATON_PANIC_FILE); */
/*     nn::fs::FileHandle handle; */
/*     size_t len; */
/*  */
/*     if (result.IsFailure()) { */
/*         result = nn::fs::CreateFile(MEGATON_PANIC_FILE, 0); */
/*         if (result.IsFailure()) { */
/*             goto abort; */
/*         } */
/*     } */
/*     result = nn::fs::OpenFile(&handle, MEGATON_PANIC_FILE, nn::fs::OpenMode_ReadWrite | nn::fs::OpenMode_Append); */
/*     if (result.IsFailure()) { */
/*         goto abort; */
/*     } */
/*  */
/*     len = strlen(msg); */
/*     result = nn::fs::SetFileSize(handle, len); */
/*     if (result.IsFailure()) { */
/*         goto close; */
/*     } */
/*     nn::fs::WriteFile(handle, 0, msg, len, nn::fs::WriteOption::CreateOption(nn::fs::WriteOptionFlag_Flush)); */
/* close: */
/*     nn::fs::CloseFile(handle); */
/*  */
/* abort: */
/*     EXL_ABORT(0x420); */
/* } */

extern "C" NORETURN void exl_exception_entry() {
    /* TODO: exception handling */
    EXL_ABORT(0x420);
}

