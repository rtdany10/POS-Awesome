<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline primary--text">{{ __(`Create POS Opening Shift`) }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  :items="companies"
                  :label="__(`Company`)"
                  v-model="company"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  :items="posProfiles"
                  :label="__(`POS Profile`)"
                  v-model="posProfile"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-data-table
                  :headers="paymentsMethodsHeaders"
                  :items="paymentsMethods"
                  item-value="mode_of_payment"
                  class="elevation-1"
                  :items-per-page="itemsPerPage"
                  hide-default-footer
                >
                  <template v-slot:item.amount="{ item }">
                    {{ (item.currency) }}
                    <v-text-field
                      v-model="item.amount"
                      :rules="[max25chars]"
                      :label="__(`Edit`)"
                      single-line
                      counter
                      type="number"
                    ></v-text-field>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" dark @click="goDesk">Cancel</v-btn>
          <v-btn color="success" :loading="isLoading" dark @click="submitDialog">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { ref, onMounted, watch, inject } from 'vue';
import { evntBus } from '../../bus';
import format from '../../format';

export default {
  mixins: [format],
  props: ['dialog'],
  setup(props) {
    const __ = inject('__');

    const isOpen = ref(props.dialog || false);
    const isLoading = ref(false);

    const companies = ref([]);
    const company = ref('');

    const posProfilesData = ref([]);
    const posProfiles = ref([]);
    const posProfile = ref('');

    const paymentsMethodData = ref([]);
    const paymentsMethods = ref([]);

    const paymentsMethodsHeaders = ref([
      {
        title: __(`Mode of Payment`),
        align: 'start',
        sortable: false,
        value: 'mode_of_payment',
      },
      {
        title: __(`Opening Amount`),
        value: 'amount',
        align: 'center',
        sortable: false,
      },
    ]);

    const itemsPerPage = ref(100);

    const max25chars = (v) => (v?.toString().length <= 12 || 'Input too long!');

    const getOpeningDialogData = async () => {
      const response = await frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_opening_dialog_data',
        args: {},
      });

      if (response.message) {
        companies.value = response.message.companies.map((el) => el.name);
        company.value = companies.value[0];

        posProfilesData.value = response.message.pos_profiles_data;
        paymentsMethodData.value = response.message.payments_method;
      }
    };

    const submitDialog = async () => {
      if (!paymentsMethods.value.length || !company.value || !posProfile.value) {
        return;
      }

      isLoading.value = true;

      try {
        const response = await frappe.call({
          method: 'posawesome.posawesome.api.posapp.create_opening_voucher',
          args: {
            pos_profile: posProfile.value,
            company: company.value,
            balance_details: paymentsMethods.value,
          },
        });

        if (response.message) {
          evntBus.$emit('register_pos_data', response.message);
          evntBus.$emit('set_company', response.message.company);
          closeOpeningDialog();
        }
      } finally {
        isLoading.value = false;
      }
    };

    const goDesk = () => {
      frappe.set_route('/');
      location.reload();
    };

    const closeOpeningDialog = () => {
      evntBus.$emit('close_opening_dialog');
    };

    watch(company, (newVal) => {
      console.log("hi")
      posProfiles.value = posProfilesData.value
        .filter((el) => el.company === newVal)
        .map((el) => el.name);
      posProfile.value = posProfiles.value[0] || '';
    });

    watch(posProfile, (newVal) => {
      paymentsMethods.value = paymentsMethodData.value
        .filter((el) => el.parent === newVal)
        .map((el) => ({
          mode_of_payment: el.mode_of_payment,
          amount: 0,
          currency: el.currency,
        }));
    });

    onMounted(getOpeningDialogData);

    return {
      isOpen,
      isLoading,
      companies,
      company,
      posProfiles,
      posProfile,
      paymentsMethods,
      paymentsMethodsHeaders,
      itemsPerPage,
      max25chars,
      __,
      submitDialog,
      goDesk,
    };
  },
};
</script>

<style scoped>
.headline {
  font-weight: bold;
}
</style>
