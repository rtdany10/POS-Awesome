<template>
  <div>
    <v-autocomplete
      v-model="customer"
      :items="customers"
      item-title="customer_name"
      item-value="name"
      label="Customer"
      color="primary"
      density="compact"
      clearable
      variant="outlined"
      class="bg-white"
      :no-data-text="__('Customer not found')"
      :custom-filter="customFilter"
      :disabled="readonly"
      hide-details
      return-object
      append-inner-icon="mdi-plus"
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
      if (this.pos_profile.posa_local_storage && localStorage.customer_storage) {
        this.customers = JSON.parse(localStorage.getItem('customer_storage'));
        if (this.customers) return;
      }
      let r = await frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_customer_names',
        args: {
          pos_profile: this.pos_profile.pos_profile,
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
      evntBus.$emit('open_update_customer', null);
    },
    edit_customer() {
      evntBus.$emit('open_update_customer', this.customer_info);
    },
    customFilter(itemText, queryText, item) {
      const textOne = item.raw.customer_name?.toLowerCase() || '';
      const textTwo = item.raw.tax_id?.toLowerCase() || '';
      const textThree = item.raw.email_id?.toLowerCase() || '';
      const textFour = item.raw.mobile_no?.toLowerCase() || '';
      const textFifth = item.raw.name?.toLowerCase() || '';
      const searchText = queryText.toLowerCase();

      return (
        textOne.includes(searchText) ||
        textTwo.includes(searchText) ||
        textThree.includes(searchText) ||
        textFour.includes(searchText) ||
        textFifth.includes(searchText)
      );
    },
  },

  computed: {},

  created: function () {
    this.$nextTick(function () {
      evntBus.$on('register_pos_profile', (pos_profile) => {
        this.pos_profile = pos_profile;
        this.get_customer_names();
      });
      evntBus.$on('payments_register_pos_profile', (pos_profile) => {
        this.pos_profile = pos_profile;
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
