#pragma once
#include <nn/os.h>

namespace botw::pmdmd {
class CriticalSection {
public:
    CriticalSection();
    ~CriticalSection();
    void lock();
    void unlock();
private:
    nn::os::MutexType mCriticalSectionInner;
};
}
