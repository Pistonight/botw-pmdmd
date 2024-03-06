#pragma once

namespace botw::pmdmd {

void start_worker_thread();

/// Entry point of the worker thread
void worker_main(void* arg);

}
