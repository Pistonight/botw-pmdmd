#include <cstring>
#include <exl/lib.hpp>
#include <nn/fs.h>

#include "pmdm_dump.hpp"

namespace botw::pmdmd {

void PmdmDump::dump() {
    if (pmdm_instance == nullptr) {
        return;
    }
    pmdm_ptr = reinterpret_cast<u64>(pmdm_instance);
    std::memcpy(pmdm_dump, pmdm_instance, PMDM_SIZE);
}

constexpr const char* SD_FILE = "sd:/pmdm_dump.bin";

void PmdmDump::write_to_sd() {
    nn::fs::DirectoryEntryType type;
    nn::Result result = nn::fs::GetEntryType(&type, SD_FILE);
    nn::fs::FileHandle handle;
    size_t len;

    if (result.IsFailure()) {
        result = nn::fs::CreateFile(SD_FILE, 0);
        if (result.IsFailure()) {
            EXL_ABORT(0x420);
        }
    }
    result = nn::fs::OpenFile(
        &handle, 
        SD_FILE, 
        nn::fs::OpenMode_ReadWrite | nn::fs::OpenMode_Append
    );
    if (result.IsFailure()) {
        EXL_ABORT(0x420);
    }

    len = sizeof(PmdmDump);
    result = nn::fs::SetFileSize(handle, len);
    if (result.IsFailure()) {
        EXL_ABORT(0x420);
    }
    nn::fs::WriteFile(handle, 0, this, len, nn::fs::WriteOption::CreateOption(nn::fs::WriteOptionFlag_Flush));
    nn::fs::CloseFile(handle);
}

}
