#pragma once
#include <exl/types.h>

namespace botw::pmdmd {

extern u8* pmdm_instance;

/// Size of PMDM, same in 1.5.0 and 1.6.0
constexpr u32 PMDM_SIZE = 0x44808;

/// Packet to send
class PmdmDump {
public:
    /// Pointer to the PMDM
    u64 pmdm_ptr;
    /// The PMDM dump
    u8 pmdm_dump[PMDM_SIZE];

    /// Dump the data from the PMDM singleton
    void dump();

    /// Write the data to sd card for inspection
    void write_to_sd();
};

static_assert(sizeof(PmdmDump) == PMDM_SIZE + 8 , "Invalid size for Packet");
}
