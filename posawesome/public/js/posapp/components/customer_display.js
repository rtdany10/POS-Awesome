// Copyright (c) 2022, Wahni IT Solutions Pvt. Ltd. and contributors
// For license information, please see license.txt

import { evntBus } from '../bus';

let cd_port, cd_textEncoder, cd_writableStreamClosed;

async function connect_customer_display() {
    if (!("serial" in navigator)) return;
    if (cd_port) return;
    cd_port = await navigator.serial.requestPort();
    await cd_port.open({ baudRate: 9600 });
    cd_textEncoder = new TextEncoderStream();
    cd_writableStreamClosed = cd_textEncoder.readable.pipeTo(cd_port.writable);

    // clear the display
    await clear_display();
}

async function clear_display() {
    let c_writer = cd_port.writable.getWriter();
    let data = new Uint8Array([0x0C]);
    await c_writer.write(data);
    c_writer.releaseLock();
}

async function print_on_display(item_code, item_name, qty, rate) {
    if (!("serial" in navigator) || !cd_port) return;
    
    // clear the display
    // await writer.write(new Array(40).join(" "));
    await clear_display();
    
    let writer = cd_textEncoder.writable.getWriter();
    // generate the text
    let print_text = " " + String(qty || 1) + "    " + String(rate || "");
    if (print_text.length > 19) {
        print_text = print_text.substring(0, 19);
    } else {
        print_text = print_text + (new Array(19 - print_text.length).join(" "));
    }
    let item_text = String(item_code) + ": " + String(item_name)
    if (item_text.length > 17) item_text = item_text.substring(0, 17);
    print_text = print_text + " " + item_text

    // print and release the lock
    await writer.write(print_text);
    writer.releaseLock();
}

evntBus.$on('add_item', (item) => {
    console.log("Printing on customer display");
    print_on_display(item.item_code, item.item_name, item.qty, item.rate);
});

evntBus.$on('connect_to_display', (data) => {
    console.log("Connecting to customer display");
    connect_customer_display();
});
