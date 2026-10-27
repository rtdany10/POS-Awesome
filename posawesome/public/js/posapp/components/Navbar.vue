<template>
  <nav>
    <v-app-bar app height="40" class="elevation-2">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="grey--text"></v-app-bar-nav-icon>
      <v-img src="/assets/posawesome/js/posapp/components/pos/pos.png" alt="POS Awesome" max-width="32" class="mr-2"
        rounded="circle"></v-img>
      <v-toolbar-title @click="go_desk" style="cursor: pointer" class="text-uppercase primary--text">
        <span class="font-weight-light">pos</span>
        <span>awesome</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-btn style="cursor: unset" text color="primary">
        <span right>{{ pos_profile.name }}</span>
      </v-btn>
      <div class="text-center">
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark text v-bind="props">Menu</v-btn>
          </template>
          <v-card class="mx-auto" max-width="300" tile>
            <v-list dense v-model="menu_item" color="primary">
                <v-list-item
                  @click="close_shift_dialog"
                  v-if="!pos_profile.posa_hide_closing_shift && item == 0"
                  prepend-icon="mdi-content-save-move-outline"
                >
                    <v-list-item-title>{{
                      __('Close Shift')
                    }}</v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="open_invoices_dialog"
                  v-if="pos_profile.posa_allow_print_last_invoice"
                  prepend-icon="mdi-printer"
                >
                    <v-list-item-title>{{
                      __('Reprint Invoices')
                    }}</v-list-item-title>
                </v-list-item>
                <v-divider class="my-0"></v-divider>
                <v-list-item @click="logOut" prepend-icon="mdi-logout">
                    <v-list-item-title>{{ __('Logout') }}</v-list-item-title>
                </v-list-item>
                <v-list-item @click="go_about" prepend-icon="mdi-information-outline">
                    <v-list-item-title>{{ __('About') }}</v-list-item-title>
                </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :mini-variant.sync="mini" app class="primary" width="220">
      <v-list dark v-model="item" color="white">
        <v-list-item class="px-2" :prepend-avatar="company_img">
          <v-list-item-title>{{ company }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-for="item in items" :key="item.text" @click="changePage(item.text)" :prepend-icon="item.icon">
            <v-list-item-title v-text="item.text"></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-snackbar v-model="snack" :timeout="5000" :color="snackColor" top right>
      {{ snackText }}
    </v-snackbar>

    <v-dialog v-model="invoices_dialog" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="headline primary--text">{{ __('Reprint Invoices') }}</span>
        </v-card-title>
        <v-card-text>
          <v-row dense class="mb-2">
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="invoice_search"
                :label="__('Search by Invoice ID, Customer ID or Name')"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="invoice_date"
                type="date"
                :label="__('Posting Date')"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
          <v-table density="compact" class="elevation-1">
            <thead>
              <tr>
                <th v-for="h in invoice_headers" :key="h.value" :class="h.align === 'end' ? 'text-right' : ''">{{ h.title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invoices" :key="item.name">
                <td>{{ item.name }}</td>
                <td>{{ item.customer_name }}</td>
                <td>{{ item.posting_date }}</td>
                <td>{{ (item.posting_time || '').split('.')[0] }}</td>
                <td class="text-right">{{ item.currency }} {{ item.grand_total }}</td>
                <td class="text-right">
                  <v-btn size="small" color="primary" prepend-icon="mdi-printer" @click="print_invoice(item.name)">{{ __('Print') }}</v-btn>
                </td>
              </tr>
              <tr v-if="!invoices.length && !invoices_loading">
                <td colspan="6" class="text-center">{{ __('No invoices found') }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-progress-linear v-if="invoices_loading" indeterminate></v-progress-linear>
          <div class="d-flex align-center justify-end mt-2">
            <v-btn variant="text" :disabled="invoice_page <= 1 || invoices_loading" @click="change_page(-1)">{{ __('Previous') }}</v-btn>
            <span class="mx-2">{{ __('Page') }} {{ invoice_page }}</span>
            <v-btn variant="text" :disabled="!invoices_has_more || invoices_loading" @click="change_page(1)">{{ __('Next') }}</v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="invoices_dialog = false">{{ __('Close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="freeze" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5">
          {{ freezeTitle }}
        </v-card-title>
        <v-card-text>{{ freezeMsg }}</v-card-text>
      </v-card>
    </v-dialog>
  </nav>
</template>

<script>
import { evntBus } from '../bus';
import { inject } from 'vue';

export default {
  setup() {
    const __ = inject('__');
    return { __ };
  },
  // components: {MyPopup},
  data() {
    return {
      drawer: false,
      mini: true,
      item: 0,
      items: [{ text: 'POS', icon: 'mdi-network-pos' }],
      page: '',
      fav: true,
      menu: false,
      message: false,
      hints: true,
      menu_item: 0,
      snack: false,
      snackColor: '',
      snackText: '',
      company: 'POS Awesome',
      company_img: '/assets/erpnext/images/erpnext-logo.svg',
      pos_profile: '',
      freeze: false,
      freezeTitle: '',
      freezeMsg: '',
      last_invoice: '',
      invoices_dialog: false,
      invoice_search: '',
      invoice_date: '',
      invoice_page: 1,
      invoices: [],
      invoices_has_more: false,
      invoices_loading: false,
      invoice_headers: [
        { title: __('Invoice'), value: 'name', sortable: false },
        { title: __('Customer'), value: 'customer_name', sortable: false },
        { title: __('Date'), value: 'posting_date', sortable: false },
        { title: __('Time'), value: 'posting_time', sortable: false },
        { title: __('Amount'), value: 'grand_total', align: 'end', sortable: false },
        { title: '', value: 'actions', align: 'end', sortable: false },
      ],
    };
  },
  watch: {
    invoice_date() {
      this.invoice_page = 1;
      this.load_invoices();
    },
    invoice_search() {
      clearTimeout(this._search_timer);
      this._search_timer = setTimeout(() => {
        this.invoice_page = 1;
        this.load_invoices();
      }, 400);
    },
  },
  methods: {
    open_invoices_dialog() {
      this.invoices_dialog = true;
      this.invoice_search = '';
      this.invoice_date = '';
      this.invoice_page = 1;
      this.load_invoices();
    },
    load_invoices() {
      this.invoices_loading = true;
      const request_search = this.invoice_search || '';
      frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_pos_profile_invoices',
        args: {
          pos_profile: this.pos_profile.name,
          search: request_search,
          posting_date: this.invoice_date || '',
          page: this.invoice_page,
          page_size: 20,
        },
        callback: (r) => {
          if (r.message) {
            this.invoices = r.message.invoices;
            this.invoices_has_more = r.message.has_more;
          }
        },
        always: () => {
          this.invoices_loading = false;
        },
      });
    },
    change_page(step) {
      this.invoice_page += step;
      this.load_invoices();
    },
    print_invoice(name) {
      this.print_last_invoice(name);
    },
    changePage(key) {
      this.$emit('changePage', key);
    },
    go_desk() {
      frappe.set_route('/');
      location.reload();
    },
    go_about() {
      const win = window.open(
        'https://github.com/yrestom/POS-Awesome',
        '_blank'
      );
      win.focus();
    },
    close_shift_dialog() {
      evntBus.$emit('open_closing_dialog');
    },
    show_mesage(data) {
      this.snack = true;
      this.snackColor = data.color;
      this.snackText = data.text;
    },
    logOut() {
      var me = this;
      me.logged_out = true;
      return frappe.call({
        method: 'logout',
        callback: function (r) {
          if (r.exc) {
            return;
          }
          frappe.set_route('/login');
          location.reload();
        },
      });
    },
    print_last_invoice(name) {
      name = name || this.last_invoice;
      if (!name) return;
      const print_format =
        this.pos_profile.print_format_for_online ||
        this.pos_profile.print_format;
      const letter_head = this.pos_profile.letter_head || 0;
      const url =
        frappe.urllib.get_base_url() +
        '/printview?doctype=Sales%20Invoice&name=' +
        encodeURIComponent(name) +
        '&trigger_print=1' +
        '&format=' +
        print_format +
        '&no_letterhead=' +
        letter_head;
      const printWindow = window.open(url, 'Print');
      printWindow.addEventListener(
        'load',
        function () {
          printWindow.print();
        },
        true
      );
    },
  },
  created: function () {
    this.$nextTick(function () {
      evntBus.$on('show_mesage', (data) => {
        this.show_mesage(data);
      });
      evntBus.$on('set_company', (data) => {
        this.company = data.name;
        this.company_img = data.company_logo
          ? data.company_logo
          : this.company_img;
      });
      evntBus.$on('register_pos_profile', (data) => {
        this.pos_profile = data.pos_profile;
        const payments = { text: 'Payments', icon: 'mdi-cash-register' };
        if (
          this.pos_profile.posa_use_pos_awesome_payments &&
          this.items.length !== 2
        ) {
          this.items.push(payments);
        }
      });
      evntBus.$on('set_last_invoice', (data) => {
        this.last_invoice = data;
      });
      evntBus.$on('freeze', (data) => {
        this.freeze = true;
        this.freezeTitle = data.title;
        this.freezeMsg = data.msg;
      });
      evntBus.$on('unfreeze', () => {
        this.freeze = false;
        this.freezTitle = '';
        this.freezeMsg = '';
      });
    });
  },
};
</script>

<style scoped>
</style>
