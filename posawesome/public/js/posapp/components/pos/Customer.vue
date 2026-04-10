<template>
  <div>
    <v-autocomplete
      v-model="customer"
      :items="customers"
      item-title="customer_name"
      item-value="name"
      label="Customer"
      color="primary"
      dense
      clearable
      outlined
      background-color="white"
      :no-data="__('Customer not found')"
      :custom-filter="customFilter"
      :disabled="readonly"
      hide-details
      :append-inner-icon="canCreateCustomer ? 'mdi-plus' : undefined"
      @click:append-inner="new_customer"
      prepend-inner-icon="mdi-account-edit"
      @click:prepend-inner="edit_customer"
    />
    <div class="mb-8">
      <UpdateCustomer></UpdateCustomer>
    </div>
  </div>
</template>

<script>
import { evntBus } from '../../bus';
import UpdateCustomer from './UpdateCustomer.vue';
import { inject } from 'vue';

export default {
  setup() {
    const __ = inject('__');
    const frappe = inject('frappe');
    return { __, frappe };
  },
  data: () => ({
    pos_profile: '',
    customers: [],
    customer: '',
    readonly: false,
    customer_info: {},
  }),

  components: {
    UpdateCustomer,
  },

  methods: {
    async get_customer_names() {
      const vm = this;
      if (this.customers.length > 0) {
        return;
      }
      if (vm.pos_profile.posa_local_storage && localStorage.customer_storage) {
        vm.customers = JSON.parse(localStorage.getItem('customer_storage'));
        return;
      }
      let r = await frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_customer_names',
        args: {
          pos_profile: this.pos_profile,
        },
      });

      if (r.message) {
        this.customers = r.message;
        console.info('loadCustomers');
        if (this.pos_profile.posa_local_storage) {
          localStorage.setItem('customer_storage', '');
          localStorage.setItem(
            'customer_storage',
            JSON.stringify(r.message)
          );
        }
      }
    },
    new_customer() {
      if (!this.canCreateCustomer) {
        evntBus.$emit('show_mesage', {
          text: __('You are not allowed to create a customer in this POS Profile.'),
          color: 'error',
        });
        return;
      }
      evntBus.$emit('open_update_customer', null);
    },
    edit_customer() {
      evntBus.$emit('open_update_customer', this.customer_info);
    },
    customFilter(itemText, queryText, item) {
      const query = queryText.toLowerCase();
      return Object.values(item.raw).some(val =>
        String(val).toLowerCase().includes(query)
      );
    },
  },

  computed: {
    canCreateCustomer() {
      return Boolean(this.pos_profile?.posa_allow_create_customer);
    },
  },

  created: function () {
    this.$nextTick(function () {
      evntBus.$on('register_pos_profile', (data) => {
        this.pos_profile = data.pos_profile;
        this.get_customer_names();
      });
      evntBus.$on('payments_register_pos_profile', (data) => {
        this.pos_profile = data.pos_profile;
        this.get_customer_names();
      });
      evntBus.$on('set_customer', (customer) => {
        this.customer = customer;
      });
      evntBus.$on('add_customer_to_list', (customer) => {
        this.customers.push(customer);
      });
      evntBus.$on('set_customer_readonly', (value) => {
        this.readonly = value;
      });
      evntBus.$on('set_customer_info_to_edit', (data) => {
        this.customer_info = data;
      });
      evntBus.$on('fetch_customer_details', () => {
        this.get_customer_names();
      });
    });
  },

  watch: {
    customer() {
      evntBus.$emit('update_customer', this.customer);
    },
  },
};
</script>
