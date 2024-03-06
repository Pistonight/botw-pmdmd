#pragma once

#include <exl/types.h>

namespace sead {
class TextWriter;
}

namespace botw::pmdmd{

void screen_init();
void screen_update();
void screen_render(sead::TextWriter*);
}


