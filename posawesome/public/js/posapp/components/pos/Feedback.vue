<template>
  <v-row justify="center">
    <v-dialog v-model="feedbackDialog" max-width="800px" min-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline primary--text">{{ __('Sales Person Feedback') }}</span>
        </v-card-title>
        <v-container>
          <v-col cols="12">
            <v-autocomplete
              v-model="sales_person"
              :items="sales_team"
              label="Sales Person"
              :no-data-text="__('Sales Person not found')"
              variant="outlined"
              color="primary"
              clearable
              density="compact"
              class="bg-white"
              hide-details
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="feedback"
              label="Feedback"
              variant="outlined"
              color="primary"
              clearable
              density="compact"
              class="bg-white mb-2"
              rows="4"
              auto-grow
            ></v-textarea>
          </v-col>

          <v-col cols="12">
            <div class="text-center">
              <span>{{ __('Rating') }}</span><br>
              <v-rating
                hover
                :length="5"
                :size="34"
                v-model="rating"
                active-color="primary"
              />
            </div>
          </v-col>

        </v-container>
        <v-card-actions class="mt-4">
          <v-spacer></v-spacer>
          <v-btn color="error mx-2" dark @click="close_dialog">{{ __('Close') }}</v-btn>
          <v-btn color="success" dark @click="submit_dialog">{{ __('Submit') }}</v-btn>
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
    feedbackDialog: false,
    sales_person: '',
    feedback: '',
    rating: 5,
    sales_team: [],
    sp_feedback: {},
  }),
  methods: {
    close_dialog() {
      this.feedbackDialog = false;
    },
    submit_dialog() {
      if (!this.sales_person) {
        evntBus.$emit('show_mesage', {
          text: 'Sales person is required.',
          color: 'error',
        });
        return;
      }

      const data = {
        feedback: this.feedback,
        rating: this.rating
      };

      this.sp_feedback[this.sales_person] = data;
      this.sales_team = this.sales_team.filter(sp => sp !== this.sales_person);
      if (this.sales_team.length === 0) {
        evntBus.$emit('submit_feedback', this.sp_feedback);
        this.close_dialog();
        return;
      }
      this.sales_person = this.sales_team[0] || '';
      this.feedback = '';
      this.rating = 5;
    },
  },
  created: function () {
    evntBus.$on('collect_feedback', (data) => {
      this.feedbackDialog = true;
      this.sales_team = data.map(d => d.sales_person);
      if (this.sales_team.length > 0) {
        this.sales_person = this.sales_team[0];
      }
    });
  },
};
</script>
