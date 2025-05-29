<template>
  <v-row justify="center">
    <v-dialog v-model="draftsDialog" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="headline primary--text">{{
            __('Select Order')
          }}</span>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-container>
            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <v-data-table
                  :headers="headers"
                  :items="dialog_data"
                  item-value="name"
                  class="elevation-1"
                  single-select
                  show-select
                  v-model="selected"
                >
                  <template v-slot:item.grand_total="{ item }">
                    {{ currencySymbol(item.currency) }}
                    {{ formtCurrency(item.grand_total) }}
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="close_dialog">Close</v-btn>
          <v-btn v-if="selected" color="success" @click="submit_dialog">Select</v-btn>
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
  // props: ["draftsDialog"],
  mixins: [format],
  data: () => ({
    draftsDialog: false,
    singleSelect: true,
    selected: [],
    dialog_data: {},
    headers: [
      {
        title: __('Customer'),
        value: 'customer_name',
        align: 'start',
        sortable: true,
      },
      {
        title: __('Date'),
        align: 'start',
        sortable: true,
        value: 'posting_date',
      },
      {
        title: __('Order'),
        value: 'name',
        align: 'start',
        sortable: true,
      },
      {
        title: __('Amount'),
        value: 'grand_total',
        align: 'end',
        sortable: false,
      },
    ],
  }),
  watch: {},
  methods: {
    close_dialog() {
      this.draftsDialog = false;
    },

    submit_dialog() {
      if (this.selected.length > 0) {
        let vm = this;
        frappe.call({
          method: 'posawesome.posawesome.api.posapp.map_order_to_invoice',
          args: {
            "orders": this.selected
          },
          async: false,
          callback: function (r) {
            if (r.message) {
              evntBus.$emit('load_invoice', r.message);
              vm.selected = [];
              vm.draftsDialog = false;
            }
          }
        });
      }
    }
  },
  created: function () {
    evntBus.$on('open_orders', (data) => {
      this.draftsDialog = true;
      this.dialog_data = data;
    });
  },
};
</script>
