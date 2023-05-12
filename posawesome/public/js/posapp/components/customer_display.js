// Copyright (c) 2022, Wahni IT Solutions Pvt. Ltd. and contributors
// For license information, please see license.txt

import { evntBus } from '../bus';

let cd_port, writer;
let cd_textEncoder = new TextEncoderStream();

async function connect_customer_display() {
    if (!("serial" in navigator)) return;
    if (cd_port) return;
    cd_port = await navigator.serial.requestPort();
    await cd_port.open({ baudRate: 9600 });
    cd_textEncoder.readable.pipeTo(cd_port.writable);
}

async function print_on_display(item_code, item_name, qty, subtotal) {
    console.log(qty);
    if (!("serial" in navigator) || !cd_port) return;
    
    writer = cd_textEncoder.writable.getWriter();
    // clear the display
    // await writer.write(new Array(40).join(" "));
    await writer.write('\f');

    // generate the text
    let print_text = " " + String(qty) + "      " + String(subtotal || "");
    if (print_text.length > 19) {
        print_text = print_text.substring(0, 19);
    } else {
        print_text = print_text + (new Array(19 - print_text.length).join(" "));
    }

    let item_text = String(item_code) + ": " + String(item_name)
    if (item_text.length > 19) {
        item_text = item_text.substring(0, 19);
    } else {
        item_text = item_text + (new Array(19 - item_text.length).join(" "));
    }

    print_text = item_text + print_text
    // print and release the lock
    await writer.write(print_text);
    writer.releaseLock();
}

evntBus.$on('print_item_on_display', (item, qty, subtotal) => {
    console.log("Printing on customer display");
    print_on_display(item.item_code, item.item_name, qty, subtotal);
});

evntBus.$on('connect_to_display', (data) => {
    console.log("Connecting to customer display");
    connect_customer_display();
});
