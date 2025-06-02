<template>
  <v-row justify="center">
    <v-dialog v-model="scannerDialog" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="headline primary--text">{{
            __('Scan Order')
          }}</span>
        </v-card-title>
        <v-card-text class="pa-5">
          <v-container>
            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <v-text-field
                  dense
                  clearable
                  autofocus
                  outlined
                  color="primary"
                  :label="__('Scan Order Barcode')"
                  background-color="white"
                  hide-details
                  v-model="scanned_order"
                  @keydown.esc="close_dialog"
                  @keydown.enter="submit_dialog"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="close_dialog">Close</v-btn>
          <v-btn color="success" @click="submit_dialog">Select</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { evntBus } from '../../bus';
import format from '../../format';
import { inject } from 'vue';

export default {
  setup() {
    const __ = inject('__');
    return { __ };
  },
  mixins: [format],
  data: () => ({
    scannerDialog: false,
    scanned_order: '',
    invoice_doc: {},
  }),
  watch: {},
  methods: {
    close_dialog() {
      this.scannerDialog = false;
    },

    submit_dialog() {
      if (this.scanned_order) {
        let vm = this;
        frappe.call({
          method: 'posawesome.posawesome.api.posapp.map_order_to_invoice',
          args: {
            "orders": [this.scanned_order],
            "target_doc": this.invoice_doc,
          },
          async: false,
          callback: function (r) {
            if (r.message) {
              evntBus.$emit('load_invoice', r.message);
            }
            vm.scanned_order = '';
            vm.scannerDialog = false;
          }
        });
      }
    }
  },
  created: function () {
    evntBus.$on('open_order_scanner', (data) => {
      this.invoice_doc = data;
      this.scannerDialog = true;
    });
  },
};
</script>
