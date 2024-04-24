<template>
  <q-card
    :class="bmp.label"
    class="bmp-container"
    :style="bmp.toggled == false ? '' : 'background-color: #DCEFFB'"
    style="margin-top: 10px"
  >
    <q-card-section class="bmp-content">
      <p class="bmp-title">
        {{ bmp.label }}
      </p>
      <q-separator dark inset size="3px" color="white" />
      <div>
        <div class="bmp-section">
          Efficiencies (%):
          <tr>
            <th>Nit</th>
            <th>Phos</th>
            <th>Sed</th>
          </tr>
          <tr>
            <td>
              <input
                class="bmp-input"
                :id="'nit-input-' + bmp.label"
                type="number"
                :value="
                  bmp.nitMod ? bmp.nitMod * 100 : (bmp.nit * 100).toFixed(0)
                "
                @change="updateNit(bmp, bmp.style)"
              />
            </td>
            <td>
              <input
                class="bmp-input"
                :id="'phos-input-' + bmp.label"
                type="number"
                :value="
                  bmp.phosMod ? bmp.phosMod * 100 : (bmp.phos * 100).toFixed(0)
                "
                @change="updatePhos(bmp, bmp.style)"
              />
            </td>
            <td>
              <input
                class="bmp-input"
                :id="'sed-input-' + bmp.label"
                type="number"
                :value="
                  bmp.sedMod ? bmp.sedMod * 100 : (bmp.sed * 100).toFixed(0)
                "
                @change="updateSed(bmp, bmp.style)"
              />
            </td>
          </tr>
        </div>

        <div
          class="bmp-section"
          v-if="bmp.type == 'full' || bmp.type == 'defined'"
        >
          Event Mean Concentration (mg/L):
          <tr>
            <th>Phos:</th>
            <th>Nit:</th>
          </tr>
          <tr>
            <td>
              <input
                class="bmp-input"
                type="number"
                :value="bmp.phos_em"
                disabled
              />
            </td>
            <td>
              <input
                class="bmp-input"
                type="number"
                :value="bmp.nit_em"
                disabled
              />
            </td>
          </tr>
        </div>

        <div
          class="bmp-section"
          v-if="bmp.type == 'full' || bmp.type == 'defined'"
        >
          Cover-Management Factor:
          <input
            class="bmp-input"
            :id="'cm-input-' + bmp.label"
            type="number"
            :value="bmp.cmMod ? bmp.cmMod : bmp.cm_factor"
            @change="updateCM(bmp, bmp.style)"
          />
        </div>
        <div
          class="bmp-section"
          v-if="bmp.type == 'full' || bmp.type == 'defined'"
        >
          Support-Management Factor:
          <input
            class="bmp-input"
            :id="'sp-input-' + bmp.label"
            type="number"
            :value="bmp.spMod ? bmp.spMod : bmp.sp_factor"
            @change="updateSP(bmp, bmp.style)"
          />
        </div>
        <div
          class="bmp-section"
          v-if="bmp.type == 'defined' || bmp.type == 'exclusive'"
        >
          Area to apply BMP (%):
          <input
            class="bmp-input"
            id="area-apply"
            type="number"
            :style="
              bmp.area_percent === 0
                ? 'border: 2px solid red'
                : 'border: 2px solid black'
            "
            :value="bmp.area_percent"
            @change="this.newArea(bmp)"
          />
        </div>
        <div class="bmp-button-group">
          <q-btn
            class="bmp-button"
            color="primary"
            label="Remove"
            @click="$emit(remove)"
          >
            <q-tooltip> Remove BMP </q-tooltip>
          </q-btn>
          <q-btn
            class="bmp-button"
            color="primary"
            label="Toggle"
            @click="
              $emit(toggle);
              this.toggledOff = true;
            "
          >
            <q-tooltip v-if="bmp.toggled == true"> Toggle Off </q-tooltip>
            <q-tooltip v-if="bmp.toggled == false"> Toggle On </q-tooltip>
          </q-btn>
          <q-btn
            v-if="
              bmp.nitMod || bmp.phosMod || bmp.sedMod || bmp.cmMod || bmp.spMod
            "
            class="bmp-button"
            color="primary"
            label="Reset Values"
            @click="resetValues(bmp)"
          >
            <q-tooltip>Reset Values</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
export default {
  data() {
    return {};
  },
  props: {
    bmp: { type: Object },
    remove: { type: String },
    toggle: { type: String },
  },
  computed: {
    toggledOff: {
      get() {
        return this.$store.state.toggledOff;
      },
      set(value) {
        this.$store.commit('updateToggledOff', value);
      },
    },
    areaChanged: {
      get() {
        return this.$store.state.areaChanged;
      },
      set(value) {
        this.$store.commit('updateAreaChanged', value);
      },
    },
    bmpAltered: {
      get() {
        return this.$store.state.bmpAltered;
      },
      set(value) {
        this.$store.commit('updateBmpAltered', value);
      },
    },
    areaApplied: {
      get() {
        return this.$store.state.areaApplied;
      },
      set(value) {
        this.$store.commit('updateAreaApplied', value);
      },
    },
    bmpSelect: {
      get() {
        return this.$store.state.bmpSelect;
      },
      set(value) {
        this.$store.commit('updateBmpSelect', value);
      },
    },
    initLoadData: {
      get() {
        return this.$store.state.initLoadData;
      },
      set(value) {
        this.$store.commit('updateInitLoadData', value);
      },
    },
  },
  methods: {
    newArea(val) {
      this.areaChanged = !this.areaChanged;
      let a = document.getElementById('area-apply');
      this.bmpAltered = val;
      this.bmpAltered.style =
        this.$store.state.setBuildNrcsStore.lastCrop.label;
      this.bmpAltered.area_percent = parseInt(a.value);
      this.areaApplied = parseInt(a.value);
      val.area_percent = this.areaApplied;

      this.bmpSelect.forEach((a, i) => {
        if (a.label === this.bmpAltered.label) {
          this.bmpSelect[i] = this.bmpAltered;
        }
      });

      this.$store.dispatch('buildNrcsStore', [
        this.bmpSelect,
        this.$store.state.setBuildNrcsStore.lastCrop,
      ]);
    },
    updateNit(bmp, crop) {
      let input;

      this.bmpSelect.forEach((i) => {
        if (i.label == bmp.label && i.style == crop) {
          // Change background color of the cell
          input = document.getElementById('nit-input-' + bmp.label);
          input.style.backgroundColor = '#f5e95b94';

          // Add property for new input value to the bmp
          i.nitMod = parseInt(input.value) / 100;
        }
      });

      this.$store.dispatch('buildNrcsStore', [
        this.bmpSelect,
        this.$store.state.setBuildNrcsStore.lastCrop,
      ]);
    },
    updatePhos(bmp, crop) {
      let input;

      this.bmpSelect.forEach((i) => {
        if (i.label == bmp.label && i.style == crop) {
          // Change background color of the cell
          input = document.getElementById('phos-input-' + bmp.label);
          input.style.backgroundColor = '#f5e95b94';

          // Add property for new input value to the bmp
          i.phosMod = parseInt(input.value) / 100;
        }
      });

      this.$store.dispatch('buildNrcsStore', [
        this.bmpSelect,
        this.$store.state.setBuildNrcsStore.lastCrop,
      ]);
    },
    updateSed(bmp, crop) {
      let input;

      this.bmpSelect.forEach((i) => {
        if (i.label == bmp.label && i.style == crop) {
          // Change background color of the cell
          input = document.getElementById('sed-input-' + bmp.label);
          input.style.backgroundColor = '#f5e95b94';

          // Add property for new input value to the bmp
          i.sedMod = parseInt(input.value) / 100;
        }
      });

      this.$store.dispatch('buildNrcsStore', [
        this.bmpSelect,
        this.$store.state.setBuildNrcsStore.lastCrop,
      ]);
    },
    updateCM(bmp, crop) {
      let input;

      this.bmpSelect.forEach((i) => {
        if (i.label == bmp.label && i.style == crop) {
          // Change background color of the cell
          input = document.getElementById('cm-input-' + bmp.label);
          input.style.backgroundColor = '#f5e95b94';

          // Add property for new input value to the bmp
          i.cmMod = parseFloat(input.value);
        }
      });

      this.$store.dispatch('buildNrcsStore', [
        this.bmpSelect,
        this.$store.state.setBuildNrcsStore.lastCrop,
      ]);
    },
    updateSP(bmp, crop) {
      let input;

      this.bmpSelect.forEach((i) => {
        if (i.label == bmp.label && i.style == crop) {
          // Change background color of the cell
          input = document.getElementById('sp-input-' + bmp.label);
          input.style.backgroundColor = '#f5e95b94';

          // Add property for new input value to the bmp
          i.spMod = parseInt(input.value);
        }
      });

      this.$store.dispatch('buildNrcsStore', [
        this.bmpSelect,
        this.$store.state.setBuildNrcsStore.lastCrop,
      ]);
    },
    resetValues(bmp) {
      if (bmp.nitMod) {
        let inputStyle = document.getElementById(
          'nit-input-' + bmp.label
        ).style;

        inputStyle.backgroundColor = '#ffffff';
        inputStyle.border = '1px solid black';
        inputStyle.borderRadius = '2px';
        delete bmp.nitMod;
      }
      if (bmp.phosMod) {
        let inputStyle = document.getElementById(
          'phos-input-' + bmp.label
        ).style;

        inputStyle.backgroundColor = '#ffffff';
        inputStyle.border = '1px solid black';
        inputStyle.borderRadius = '2px';
        delete bmp.phosMod;
      }
      if (bmp.sedMod) {
        let inputStyle = document.getElementById(
          'sed-input-' + bmp.label
        ).style;

        inputStyle.backgroundColor = '#ffffff';
        inputStyle.border = '1px solid black';
        inputStyle.borderRadius = '2px';
        delete bmp.sedMod;
      }
      if (bmp.cmMod) {
        let inputStyle = document.getElementById('cm-input-' + bmp.label).style;

        inputStyle.backgroundColor = '#ffffff';
        inputStyle.border = '1px solid black';
        inputStyle.borderRadius = '2px';
        delete bmp.cmMod;
      }
      if (bmp.spMod) {
        let inputStyle = document.getElementById('sp-input-' + bmp.label).style;

        inputStyle.backgroundColor = '#ffffff';
        inputStyle.border = '1px solid black';
        inputStyle.borderRadius = '2px';
        delete bmp.spMod;
      }
    },
  },
};
</script>

<style scoped>
.bmp-container {
  max-width: fit-content;
  margin: 0px auto 10px auto;
}
.bmp-input {
  max-width: 45px;
}
.bmp-title {
  font-weight: bold;
  margin: auto auto 10px auto;
  width: 350px;
  text-align: center;
}
.bmp-button-group {
  margin: auto;
  width: max-content;
  display: block;
}
.bmp-button {
  margin: 15px 5px 0 5px;
}
.bmp-section {
  margin: 10px auto;
  width: fit-content;
}
.bmp-content {
  margin: auto;
  width: max-content;
  display: block;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
