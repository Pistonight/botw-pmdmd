#pragma once

#include <exl/types.h>

namespace sead {
class TextWriter;
}

namespace uks::screen {

void init();
void update();
void render(sead::TextWriter*);
}


