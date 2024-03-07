function newPauseMenuDataMgr(off, ...args) { return new PauseMenuDataMgr(off, ...args); }
class PauseMenuDataMgr {
    constructor(off) {
        this.off = off;
        let offset = 0;
        this[`${toHex(offset, 5, "x")}_vfptr`] = newInt64(off+offset);
        offset += 8;
        this[`${toHex(offset, 5, "x")}_Disposer`] = newSeadDisposer(off+offset);
        offset += 32;
        this[`${toHex(offset, 5, "x")}_CriticalSection`] = newSeadCriticalSection(off+offset);
        offset += 64;
        this[`${toHex(offset, 5, "x")}_InventoryItemList`] = newSeadOffsetList(off+offset, PouchItem);
        offset += sizeofSeadOffsetList(PouchItem);
        this[`${toHex(offset, 5, "x")}_UnusedItemStack`] = newSeadOffsetList(off+offset, PouchItem);
        offset += sizeofSeadOffsetList(PouchItem);
        this[`${toHex(offset, 5, "x")}_ItemPool`] = newStructArray(off+offset, 420, 664, "PouchItem", ((off)=>newPouchItem(off+0)));
        offset += 278880;
        this[`${toHex(offset, 5, "x")}_ListHeads`] = newStructArray(off+offset, 7, 8, "PouchItem**", ((off)=>newPtr(off+0, "PouchItem*", (off)=>[off, ])));
        offset += 56;
        this[`${toHex(offset, 5, "x")}_Tabs`] = newStructArray(off+offset, 50, 8, "PouchItem*", ((off)=>newPtr(off+0, "PouchItem", (off)=>[off])));
        offset += 400;
        this[`${toHex(offset, 5, "x")}_TabsType`] = newStructArray(off+offset, 50, 4, "Int32", ((off)=>newInt32(off+0)));
        offset += 200;
        this[`${toHex(offset, 5, "x")}_LastAddedItem`] = newPtr(off+offset, "PouchItem", (off)=>[off]);
        offset += 8;
        this[`${toHex(offset, 5, "x")}_LastAddedItemTab`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_LastAddedItemSlot`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_NumTabs`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_pad`] = newByteArray(off+offset, 4);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_HoldingItems`] = newStructArray(off+offset, 5, 16, "HoldingItem", ((off)=>newHoldingItem(off+0)));
        offset += 80;
        this[`${toHex(offset, 5, "x")}_Item_Unknown1`] = newPtr(off+offset, "PouchItem", (off)=>[off]);
        offset += 8;
        this[`${toHex(offset, 5, "x")}_Unknown2`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_Unknown3`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_Unknown4`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_Unknown5`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_Unknown6`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_Unknown7`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_Unknown8`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_Unknown9`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_ItemRitoSoul`] = newPtr(off+offset, "PouchItem", (off)=>[off]);
        offset += 8;
        this[`${toHex(offset, 5, "x")}_ItemGoronSoul`] = newPtr(off+offset, "PouchItem", (off)=>[off]);
        offset += 8;
        this[`${toHex(offset, 5, "x")}_ItemZoraSoul`] = newPtr(off+offset, "PouchItem", (off)=>[off]);
        offset += 8;
        this[`${toHex(offset, 5, "x")}_ItemGerudoSoul`] = newPtr(off+offset, "PouchItem", (off)=>[off]);
        offset += 8;
        this[`${toHex(offset, 5, "x")}_CanSeeHealthBar`] = newInt8(off+offset);
        offset += 1;
        this[`${toHex(offset, 5, "x")}_pad`] = newByteArray(off+offset, 7);
        offset += 7;
        this[`${toHex(offset, 5, "x")}_NewlyAddedItem`] = newPouchItem(off+offset);
        offset += 664;
        this[`${toHex(offset, 5, "x")}_IsPouchForQuest`] = newInt8(off+offset);
        offset += 1;
        this[`${toHex(offset, 5, "x")}_pad`] = newByteArray(off+offset, 7);
        offset += 7;
        this[`${toHex(offset, 5, "x")}_EquippedItems`] = newStructArray(off+offset, 4, 8, "PouchItem*", ((off)=>newPtr(off+0, "PouchItem", (off)=>[off])));
        offset += 32;
        this[`${toHex(offset, 5, "x")}_CategoryToSort`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 5, "x")}_pad`] = newByteArray(off+offset, 4);
        offset += 4;
    }
}
function newHoldingItem(off, ...args) { return new HoldingItem(off, ...args); }
class HoldingItem {
    constructor(off) {
        this.off = off;
        let offset = 0;
        this[`${toHex(offset, 2, "x")}_Item`] = newPtr(off+offset, "PouchItem", (off)=>[off]);
        offset += 8;
        this[`${toHex(offset, 2, "x")}_Unknown1`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Unknown2`] = newInt32(off+offset);
        offset += 4;
    }
}
function newPouchItem(off, ...args) { return new PouchItem(off, ...args); }
class PouchItem {
    constructor(off) {
        this.off = off;
        let offset = 0;
        this[`${toHex(offset, 3, "x")}_vfptr`] = newInt64(off+offset);
        offset += 8;
        this[`${toHex(offset, 3, "x")}_Prev`] = newPouchItemOffsetPtr(off+offset);
        offset += 8;
        this[`${toHex(offset, 3, "x")}_Next`] = newPouchItemOffsetPtr(off+offset);
        offset += 8;
        this[`${toHex(offset, 3, "x")}_Type`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 3, "x")}_ItemUse`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 3, "x")}_Value`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 3, "x")}_Equipped`] = newInt8(off+offset);
        offset += 1;
        this[`${toHex(offset, 3, "x")}_InInventory`] = newInt8(off+offset);
        offset += 1;
        this[`${toHex(offset, 3, "x")}_pad`] = newByteArray(off+offset, 2);
        offset += 2;
        this[`${toHex(offset, 3, "x")}_Name`] = newSeadFixedSafeString(off+offset, 64);
        offset += sizeofSeadFixedSafeString(64);
        this[`${toHex(offset, 3, "x")}_Data`] = newPouchItemData(off+offset);
        offset += 20;
        this[`${toHex(offset, 3, "x")}_Ingredients`] = newPouchItemIngredients(off+offset);
        offset += 520;
        this.pos = (off - 0x98) / 0x298;
    }
}
function newPouchItemData(off, ...args) { return new PouchItemData(off, ...args); }
class PouchItemData {
    constructor(off) {
        this.PouchItemDataCook = newPouchItemDataCook(off+0);
        this.PouchItemDataWeapon = newPouchItemDataWeapon(off+0);
    }
}
function newPouchItemDataCook(off, ...args) { return new PouchItemDataCook(off, ...args); }
class PouchItemDataCook {
    constructor(off) {
        this.off = off;
        let offset = 0;
        this[`${toHex(offset, 2, "x")}_Value`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Unknown1`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Price`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Unknown3`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Unknown4`] = newInt32(off+offset);
        offset += 4;
    }
}
function newPouchItemDataWeapon(off, ...args) { return new PouchItemDataWeapon(off, ...args); }
class PouchItemDataWeapon {
    constructor(off) {
        this.off = off;
        let offset = 0;
        this[`${toHex(offset, 2, "x")}_Value`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Unknown1`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Modifier`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Unknown3`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Unknown4`] = newInt32(off+offset);
        offset += 4;
    }
}
function newPouchItemIngredients(off, ...args) { return new PouchItemIngredients(off, ...args); }
class PouchItemIngredients {
    constructor(off) {
        this.off = off;
        let offset = 0;
        this[`${toHex(offset, 2, "x")}_data`] = newByteArray(off+offset, 520);
        offset += 520;
    }
}
function newSeadDisposer(off, ...args) { return new SeadDisposer(off, ...args); }
class SeadDisposer {
    constructor(off) {
        this.off = off;
        let offset = 0;
        this[`${toHex(offset, 2, "x")}_data`] = newByteArray(off+offset, 32);
        offset += 32;
    }
}
function newSeadCriticalSection(off, ...args) { return new SeadCriticalSection(off, ...args); }
class SeadCriticalSection {
    constructor(off) {
        this.off = off;
        let offset = 0;
        this[`${toHex(offset, 2, "x")}_data`] = newByteArray(off+offset, 64);
        offset += 64;
    }
}
function newSeadFixedSafeString(off, ...args) { return new SeadFixedSafeString(off, ...args); }
class SeadFixedSafeString {
    constructor(off, len) {
        this.off = off;
        this.len = len;
        let offset = 0;
        this[`${toHex(offset, 2, "x")}_vfptr`] = newInt64(off+offset);
        offset += 8;
        this[`${toHex(offset, 2, "x")}_StringTop`] = newByteString(off+offset);
        offset += 8;
        this[`${toHex(offset, 2, "x")}_BufferSize`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Buffer`] = newByteArray(off+offset, this.len);
        offset += this.len;
    }
    sizeof() {
        return 20 + this.len;
    }
}
function sizeofSeadFixedSafeString(len) {
    return newSeadFixedSafeString(0, len).sizeof();
}
function newSeadOffsetList(off, ...args) { return new SeadOffsetList(off, ...args); }
class SeadOffsetList {
    constructor(off, TNode) {
        this.off = off;
        this.TNode = TNode;
        let offset = 0;
        this[`${toHex(offset, 2, "x")}_HeadPrev`] = newPouchItemOffsetPtr(off+offset);
        offset += 8;
        this[`${toHex(offset, 2, "x")}_HeadNext`] = newPouchItemOffsetPtr(off+offset);
        offset += 8;
        this[`${toHex(offset, 2, "x")}_Count`] = newInt32(off+offset);
        offset += 4;
        this[`${toHex(offset, 2, "x")}_Offset`] = newInt32(off+offset);
        offset += 4;
    }
    sizeof() {
        return 24;
    }
}
function sizeofSeadOffsetList(TNode) {
    return newSeadOffsetList(0, TNode).sizeof();
}