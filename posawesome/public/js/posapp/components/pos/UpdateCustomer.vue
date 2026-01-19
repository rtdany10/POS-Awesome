<template>
  <v-row justify="center">
    <v-dialog
      v-model="customerDialog"
      max-width="600px"
      @click:outside="clear_customer"
    >
      <v-card>
        <v-card-title>
          <span v-if="customer_id" class="headline primary--text">{{
            __('Update Customer')
          }}</span>
          <span v-else class="headline primary--text">{{
            __('Create Customer')
          }}</span>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Customer Name') + ' *'"
                  background-color="white"
                  hide-details
                  v-model="customer_name"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Tax ID')"
                  background-color="white"
                  hide-details
                  v-model="tax_id"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Mobile No')"
                  background-color="white"
                  hide-details
                  v-model="mobile_no"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Email ID')"
                  background-color="white"
                  hide-details
                  v-model="email_id"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  dense
                  label="Gender"
                  :items="genders"
                  v-model="gender"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  clearable
                  dense
                  auto-select-first
                  color="primary"
                  :label="frappe._('Nationality')"
                  v-model="nationality"
                  :items="countries"
                  background-color="white"
                  :no-data-text="__('Countries not found')"
                  hide-details
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  clearable
                  dense
                  auto-select-first
                  color="primary"
                  :label="frappe._('Emirate')"
                  v-model="emirate"
                  :items="emirates"
                  background-color="white"
                  :no-data-text="__('Emirates not found')"
                  hide-details
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  clearable
                  dense
                  auto-select-first
                  color="primary"
                  :label="frappe._('Family Size')"
                  v-model="family_size"
                  :items="family_sizes"
                  background-color="white"
                  :no-data-text="__('Family Sizes not found')"
                  hide-details
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Location')"
                  background-color="white"
                  hide-details
                  v-model="location"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  clearable
                  dense
                  auto-select-first
                  color="primary"
                  :label="frappe._('Customer Group') + ' *'"
                  v-model="group"
                  :items="groups"
                  background-color="white"
                  :no-data-text="__('Group not found')"
                  hide-details
                  required
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  clearable
                  dense
                  auto-select-first
                  color="primary"
                  :label="frappe._('Territory') + ' *'"
                  v-model="territory"
                  :items="territorys"
                  background-color="white"
                  :no-data-text="__('Territory not found')"
                  hide-details
                  required
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="6">
                <v-menu
                    v-model="birthday_menu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                >
                  <template v-slot:activator="{ props }">
                      <v-text-field
                          v-model="birthday"
                          label="Birthday"
                          readonly
                          outlined
                          density="compact"
                          variant="outlined"
                          background-color="white"
                          clearable
                          color="primary"
                          hide-details
                          v-bind="props"
                          prepend-inner-icon="mdi-calendar"
                      />
                  </template>
                  <v-date-picker
                      v-model="birthday"
                      no-title
                      color="primary"
                      @input="birthday_menu = false"
                      @update:model-value="onBirthdaySelect()"
                  />
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                    v-model="anniversary_menu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                >
                  <template v-slot:activator="{ props }">
                      <v-text-field
                          v-model="anniversary"
                          label="Anniversary"
                          readonly
                          outlined
                          density="compact"
                          variant="outlined"
                          background-color="white"
                          clearable
                          color="primary"
                          hide-details
                          v-bind="props"
                          prepend-inner-icon="mdi-calendar"
                      />
                  </template>
                  <v-date-picker
                      v-model="anniversary"
                      no-title
                      color="primary"
                      @input="anniversary_menu = false"
                      @update:model-value="onAnniversarySelect()"
                  />
                </v-menu>
              </v-col>
              <v-col cols="6" v-if="!loyalty_program">
                <v-checkbox
                  v-model="skip_loyalty"
                  :label="frappe._('Skip Loyalty Program Enrollment')"
                  density="compact"
                  hide-details
                ></v-checkbox>
              </v-col>
              <v-col cols="6" v-if="loyalty_program">
                <v-text-field
                  v-model="loyalty_program"
                  :label="frappe._('Loyalty Program')"
                  dense
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="6" v-if="loyalty_points">
                <v-text-field
                  v-model="loyalty_points"
                  :label="frappe._('Loyalty Points')"
                  dense
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" dark @click="close_dialog">{{
            __('Close')
          }}</v-btn>
          <v-btn color="success" dark @click="submit_dialog">{{
            __('Submit')
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { evntBus } from '../../bus';
import { inject } from 'vue';

export default {
  setup() {
    const __ = inject('__');
    const frappe = inject('frappe');
    return { __, frappe };
  },
  data: () => ({
    customerDialog: false,
    pos_profile: '',
    customer_id: '',
    customer_name: '',
    tax_id: '',
    mobile_no: '',
    email_id: '',
    referral_code: '',
    birthday: null,
    birthday_menu: false,
    group: '',
    groups: [],
    territory: '',
    territorys: [],
    genders: [],
    customer_type: 'Individual',
    gender: '',
    loyalty_points: null,
    loyalty_program: null,
    nationality: '',
    countries: [],
    skip_loyalty: false,
    emirate: '',
    emirates: [
      "Abu Dhabi",
      "Ajman",
      "Dubai",
      "Fujairah",
      "Ras Al Khaimah",
      "Sharjah",
      "Umm Al Quwain",
    ],
    family_size: '',
    family_sizes: ['1', '2', '3', '4', '5', '6', '>6'],
    anniversary_menu: false,
    anniversary: null,
    location: '',
  }),
  watch: {},
  methods: {
    onAnniversarySelect() {
      this.anniversary = frappe.datetime.obj_to_str((new Date(this.anniversary)));
      this.anniversary_menu = false;
    },
    onBirthdaySelect() {
      this.birthday = frappe.datetime.obj_to_str((new Date(this.birthday)));
      this.birthday_menu = false;
    },
    close_dialog() {
      this.customerDialog = false;
      this.clear_customer();
    },
    clear_customer() {
      this.customer_name = '';
      this.tax_id = '';
      this.mobile_no = '';
      this.email_id = '';
      this.referral_code = '';
      this.birthday = '';
      this.group = frappe.defaults.get_user_default('Customer Group');
      this.territory = frappe.defaults.get_user_default('Territory');
      this.nationality = frappe.defaults.get_user_default('Country');
      this.customer_id = '';
      this.customer_type = 'Individual';
      this.gender = '';
      this.loyalty_points = null;
      this.loyalty_program = null;
      this.skip_loyalty = false;
      this.anniversary = null;
      this.emirate = '';
      this.location = '';
      this.family_size = '';
    },
    getCustomerGroups() {
      if (this.groups.length > 0) return;
      const vm = this;
      frappe.db
        .get_list('Customer Group', {
          fields: ['name'],
          filters: { is_group: 0 },
          limit: 1000,
          order_by: 'name',
        })
        .then((data) => {
          if (data.length > 0) {
            data.forEach((el) => {
              vm.groups.push(el.name);
            });
          }
        });
    },
    getCustomerTerritorys() {
      if (this.territorys.length > 0) return;
      const vm = this;
      frappe.db
        .get_list('Territory', {
          fields: ['name'],
          filters: { is_group: 0 },
          limit: 5000,
          order_by: 'name',
        })
        .then((data) => {
          if (data.length > 0) {
            data.forEach((el) => {
              vm.territorys.push(el.name);
            });
          }
        });
    },
    getGenders() {
      const vm = this;
      frappe.db
        .get_list('Gender', {
          fields: ['name'],
          page_length: 10,
        })
        .then((data) => {
          if (data.length > 0) {
            data.forEach((el) => {
              vm.genders.push(el.name);
            });
          }
        });
    },
    async getCountries() {
      const vm = this;
      const data = await frappe.db.get_list('Country', {
        fields: ['name'],
        page_length: 250,
        order_by: 'name',
      });
      if (data.length > 0) {
        data.forEach((el) => {
          vm.countries.push(el.name);
        });
      }
    },
    submit_dialog() {
      // validate if all required fields are filled
      if (!this.customer_name) {
        evntBus.$emit('show_mesage', {
          text: __('Customer name is required.'),
          color: 'error',
        });
        return;
      }
      if (!this.group) {
        evntBus.$emit('show_mesage', {
          text: __('Customer group is required.'),
          color: 'error',
        });
        return;
      }
      if (!this.territory) {
        evntBus.$emit('show_mesage', {
          text: __('Customer territory is required.'),
          color: 'error',
        });
        return;
      }
      // if (!this.skip_loyalty) {
      //   if (!this.gender) {
      //     evntBus.$emit('show_mesage', {
      //       text: __('Gender is required for loyalty enrollment.'),
      //       color: 'error',
      //     });
      //     return;
      //   }

      //   if (!this.mobile_no) {
      //     evntBus.$emit('show_mesage', {
      //       text: __('Mobile number is required for loyalty enrollment.'),
      //       color: 'error',
      //     });
      //     return;
      //   }

      //   if (!this.email_id) {
      //     evntBus.$emit('show_mesage', {
      //       text: __('Email ID is required for loyalty enrollment.'),
      //       color: 'error',
      //     });
      //     return;
      //   }

      //   if (!this.nationality) {
      //     evntBus.$emit('show_mesage', {
      //       text: __('Nationality is required for loyalty enrollment.'),
      //       color: 'error',
      //     });
      //     return;
      //   }
      // }
      if (this.customer_name) {
        const vm = this;
        const args = {
          customer_id: this.customer_id,
          customer_name: this.customer_name,
          company: this.pos_profile.company,
          tax_id: this.tax_id,
          mobile_no: this.mobile_no,
          email_id: this.email_id,
          referral_code: this.referral_code,
          birthday: this.birthday,
          anniversary: this.anniversary,
          skip_loyalty: this.skip_loyalty,
          family_size: this.family_size,
          location: this.location,
          emirate: this.emirate,
          customer_group: this.group,
          territory: this.territory,
          customer_type: this.customer_type,
          gender: this.gender,
          nationality: this.nationality,
          method: this.customer_id ? 'update' : 'create',
          pos_profile_doc: this.pos_profile,
        };
        frappe.call({
          method: 'posawesome.posawesome.api.posapp.create_customer',
          args: args,
          callback: (r) => {
            if (!r.exc && r.message.name) {
              let text = __('Customer created successfully.');
              if (vm.customer_id) {
                text = __('Customer updated successfully.');
              }
              evntBus.$emit('show_mesage', {
                text: text,
                color: 'success',
              });
              args.name = r.message.name;
              frappe.utils.play_sound('submit');
              evntBus.$emit('add_customer_to_list', args);
              evntBus.$emit('set_customer', r.message.name);
              evntBus.$emit('fetch_customer_details');
              this.close_dialog();
            } else {
              frappe.utils.play_sound('error');
              evntBus.$emit('show_mesage', {
                text: __('Customer creation failed.'),
                color: 'error',
              });
            }
          },
        });
        this.customerDialog = false;
      }
    },
  },
  created: function () {
    evntBus.$on('open_update_customer', (data) => {
      this.customerDialog = true;
      if (data) {
        this.customer_name = data.customer_name;
        this.customer_id = data.name;
        this.tax_id = data.tax_id;
        this.mobile_no = data.mobile_no;
        this.email_id = data.email_id;
        this.referral_code = data.referral_code;
        this.birthday = data.birthday;
        this.group = data.customer_group;
        this.territory = data.territory;
        this.loyalty_points = data.loyalty_points;
        this.loyalty_program = data.loyalty_program;
        this.gender = data.gender;
        this.anniversary = data.anniversary;
        this.location = data.location;
        this.emirate = data.emirate;
        this.family_size = data.family_size;
      }
    });
    evntBus.$on('register_pos_profile', (data) => {
      this.pos_profile = data.pos_profile;
    });
    evntBus.$on('payments_register_pos_profile', (data) => {
      this.pos_profile = data.pos_profile;
    });
    this.getCustomerGroups();
    this.getCustomerTerritorys();
    this.getGenders();
    this.getCountries();
    // set default values for customer group and territory from user defaults
    this.group = frappe.defaults.get_user_default('Customer Group');
    this.territory = frappe.defaults.get_user_default('Territory');
    this.nationality = frappe.defaults.get_user_default('Country');
  },
};
</script>
