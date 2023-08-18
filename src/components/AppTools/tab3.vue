<template>
  <div>
    <!-- first page -->
    <div>
      <div class="text-bold text-center">
        NRCS Conservation Delivery Application
        <icon-button
          v-if="!resourceVis"
          type="info"
          method="show-resource"
          @show-resource="resourceVis = true"
          style="margin: 10px"
        ></icon-button>
        <icon-button
          v-if="resourceVis"
          type="close"
          method="hide-resource"
          @hide-resource="resourceVis = false"
          style="margin: 10px"
        ></icon-button>
      </div>
      <div v-if="resourceVis === true">
        <a
          href="https://nascience.s3.us-west-1.amazonaws.com/apps/nrcs-la-cda-app/CDA+User+Manual.pdf"
          target="_blank"
          >CDA User Manual</a
        >
        <br />
        <a
          href="https://nascience.s3.us-west-1.amazonaws.com/apps/nrcs-la-cda-app/ConservationDeliveryApp_MethodsOverview.pdf"
          target="_blank"
          >Methods Document</a
        >
      </div>
      <hr />
      <div v-if="this.mngmtVis === false && this.loadingVis === false">
        <p>
          Welcome to the NRCS Conservation Delivery Application. Use this tool
          to Calculate nutrient and sediment loads and test Best Management
          Practice applications. Begin by selecting a scale for your analysis:
          Resource Unit (RU), 12-digit hydrologic unit (HUC 12), catchment or
          Agricultural field.
        </p>
        <div>
          <p class="text-bold">Reference Layers:</p>
          <div class="q-ma-md">
            <q-option-group
              v-model="reference"
              :options="scaleOptions"
              color="primary"
              dense
              style="margin-right:5px; display:flex;"
            />
            <!-- <q-checkbox v-model="reference" val="Paultry Production" label="Paultry Production" @update:model-value="" />
            <q-checkbox v-model="reference" val="Dairy Production" label="Dairy Production" @update:model-value="" /> -->
          </div>
        </div>
        <p>
          Click the map to select up to <b>five</b> analysis units from your
          selected scale. Constituent loads can only be calculated within
          features that contain agricultural fields. Click “Select Best
          Management Practices to calculate original loads and begin applying
          BMPs.
        </p>
        <div>
          <p class="text-bold">Scale:</p>
          <div class="q-my-md q-ma-auto" style="left: 5px; position: relative;">
            <q-option-group
              v-model="scale"
              :options="layerOptions"
              color="primary"
              dense
              style="display:flex;"
            />
            <!-- <q-checkbox
              dense
              v-model="scale"
              toggle-order="ft"
              val="NRCS Resource Units"
              label="Resource Units"
              style="margin-right:6px;"
              @update:model-value="checkClick"
            />
            <q-checkbox
              dense
              v-model="scale"
              toggle-order="ft"
              val="12-Digit Hydrologic Units"
              label="HUC 12"
              style="margin-right:6px;"
              @update:model-value="checkClick"
            />
            <q-checkbox
              dense
              v-model="scale"
              toggle-order="ft"
              val="Catchments"
              label="Catchments"
              style="margin-right:6px;"
              @update:model-value="checkClick"
            />
            <q-checkbox
              dense
              v-model="scale"
              toggle-order="ft"
              val="Field Boundaries"
              label="Agricultural Field"
              style="margin-right:6px;"
              @update:model-value="checkClick"
            /> -->
          </div>
        </div>
        <div
          class="selected-units text-bold q-pa-sm q-my-md"
          style="width:fit-content;margin:auto;"
        >
          Selected Units:
          <!-- Create an array in the store that will hold the list of selected units when the map is clicked -->
          <div style="display:grid;">
            <q-chip
              removable
              v-for="unit in unitSelection"
              :key="unit"
              :label="'ID: ' + unit"
              @remove="unitRemoved(unit)"
            />
          </div>
        </div>
        <q-btn
          color="primary"
          style="margin: 10px auto 10px auto; display:block;"
          @click="
            this.loadingVis = true
            /*extractData();*/
          "
          :disable="this.unitLength > 0 ? false : true"
        >
          Select Management Practices
        </q-btn>
      </div>
    </div>
    <!-- Loading Page -->
    <div
      v-if="this.loadingVis === true && this.mngmtVis === false"
      style="margin:auto;width:fit-content;"
    >
      <q-circular-progress
        indeterminate
        rounded
        size="50px"
        color="primary"
        style="margin:auto;width:fit-content;display:block;"
      />
      <br />
      <p><b>Retrieving data...</b></p>
    </div>
    <!-- second page -->
    <div v-if="this.mngmtVis === true && this.loadingVis === false">
      <div>
        <div class="text-h5 text-center">
          All Load Sources -
          {{ this.totalCropArea.toFixed(0) }} acres
        </div>
        <div>
          <!-- table -->
          <table class="total-table" style="">
            <tr>
              <th class="total-cell"></th>
              <th class="total-cell">Nit</th>
              <th class="total-cell">Phos</th>
              <th class="total-cell">Sed</th>
            </tr>
            <tr>
              <th class="total-cell">Initial Load (MT/yr):</th>
              <td class="total-cell">{{ this.totalNitr.toFixed(2) }}</td>
              <td class="total-cell">{{ this.totalPhos.toFixed(2) }}</td>
              <td class="total-cell">{{ this.totalSed.toFixed(2) }}</td>
            </tr>
            <tr>
              <th class="total-cell">New Load (MT/yr):</th>
              <td class="total-cell">{{ this.totalNewLoadNit.toFixed(2) }}</td>
              <td class="total-cell">{{ this.totalNewLoadPhos.toFixed(2) }}</td>
              <td class="total-cell">{{ this.totalNewLoadSed.toFixed(2) }}</td>
            </tr>
            <tr>
              <th class="total-cell">Reduction:</th>
              <td class="total-cell">0%</td>
              <td class="total-cell">0%</td>
              <td class="total-cell">0%</td>
            </tr>
          </table>
        </div>
      </div>

      <hr />
      <div v-if="this.finalLayer === 'NRCS Resource Units'">
        <div v-for="crop in this.resourceUnits" :key="crop">
          <q-expansion-item
            :label="crop.label + ' ' + '-' + ' ' + crop.cAcres + ' ' + 'acres'"
            expand-separator
            switch-toggle-side
            class="q-my-sm shadow-1"
            style="border: 1px solid #ccc; border-radius: 3px;"
          >
            <table class="crop-table">
              <tr>
                <th class="crop-cell"></th>
                <th class="crop-cell">Nit</th>
                <th class="crop-cell">Phos</th>
                <th class="crop-cell">Sed</th>
              </tr>
              <tr>
                <th class="crop-cell">Initial Load (MT/yr):</th>
                <td class="crop-cell">{{ crop.nitr }}</td>
                <td class="crop-cell">{{ crop.phos }}</td>
                <td class="crop-cell">{{ crop.sed }}</td>
              </tr>
              <tr>
                <th class="crop-cell">New Load (MT/yr):</th>
                <td class="crop-cell">{{ this.cropNewLoadNit.toFixed(2) }}</td>
                <td class="crop-cell">{{ this.cropNewLoadPhos.toFixed(2) }}</td>
                <td class="crop-cell">{{ this.cropNewLoadSed.toFixed(2) }}</td>
              </tr>
              <tr>
                <th class="crop-cell">Reduction:</th>
                <td class="crop-cell">{{ reducNit }} %</td>
                <td class="crop-cell">{{ reducPhos }} %</td>
                <td class="crop-cell">{{ reducSed }} %</td>
              </tr>
            </table>

            <q-select
              v-model="crop.bmpSelect"
              :options="bmpOptions"
              dense
              multiple
              outlined
              label="Select Best Management Practice(s)"
              @update:model-value="buildNrcs(crop.bmpSelect, crop)"
            />

            <div :id="crop.label"></div>
          </q-expansion-item>
        </div>
      </div>
      <div v-if="this.finalLayer === '12-Digit Hydrologic Units'">
        <div v-for="crop in this.hucUnits" :key="crop">
          <q-expansion-item
            :label="crop.label + ' ' + '-' + ' ' + crop.cAcres + ' ' + 'acres'"
            expand-separator
            switch-toggle-side
            class="q-my-sm shadow-1"
            style="border: 1px solid #ccc; border-radius: 3px;"
          >
            <table class="crop-table">
              <tr>
                <th class="crop-cell"></th>
                <th class="crop-cell">Nit</th>
                <th class="crop-cell">Phos</th>
                <th class="crop-cell">Sed</th>
              </tr>
              <tr>
                <th class="crop-cell">Initial Load (MT/yr):</th>
                <td class="crop-cell">{{ crop.nitr }}</td>
                <td class="crop-cell">{{ crop.phos }}</td>
                <td class="crop-cell">{{ crop.sed }}</td>
              </tr>
            </table>

            <q-select
              v-model="crop.bmpSelect"
              :options="bmpOptions"
              dense
              multiple
              outlined
              label="Select Best Management Practice(s)"
              @update:model-value="buildHuc(crop.bmpSelect, crop.label)"
            />

            <div :id="crop.label"></div>
          </q-expansion-item>
        </div>
      </div>
      <div v-if="this.finalLayer === 'Catchments'">
        <div v-for="crop in this.catchUnits" :key="crop">
          <q-expansion-item
            :label="crop.label + ' ' + '-' + ' ' + crop.cAcres + ' ' + 'acres'"
            expand-separator
            switch-toggle-side
            class="q-my-sm shadow-1"
            style="border: 1px solid #ccc; border-radius: 3px;"
          >
            <table class="crop-table">
              <tr>
                <th class="crop-cell"></th>
                <th class="crop-cell">Nit</th>
                <th class="crop-cell">Phos</th>
                <th class="crop-cell">Sed</th>
              </tr>
              <tr>
                <th class="crop-cell">Initial Load (MT/yr):</th>
                <td class="crop-cell">{{ crop.nitr }}</td>
                <td class="crop-cell">{{ crop.phos }}</td>
                <td class="crop-cell">{{ crop.sed }}</td>
              </tr>
            </table>

            <q-select
              v-model="crop.bmpSelect"
              :options="bmpOptions"
              dense
              multiple
              outlined
              label="Select Best Management Practice(s)"
              @update:model-value="buildCatch(crop.bmpSelect, crop.label)"
            />

            <div :id="crop.label"></div>
          </q-expansion-item>
        </div>
      </div>
      <div v-if="this.finalLayer === 'Field Boundaries'">
        <div v-for="crop in this.fieldUnits" :key="crop">
          <q-expansion-item
            :label="crop.label + ' ' + '-' + ' ' + crop.cAcres + ' ' + 'acres'"
            expand-separator
            switch-toggle-side
            class="q-my-sm shadow-1"
            style="border: 1px solid #ccc; border-radius: 3px;"
          >
            <table class="crop-table">
              <tr>
                <th class="crop-cell"></th>
                <th class="crop-cell">Nit</th>
                <th class="crop-cell">Phos</th>
                <th class="crop-cell">Sed</th>
              </tr>
              <tr>
                <th class="crop-cell">Initial Load (MT/yr):</th>
                <td class="crop-cell">{{ crop.nitr }}</td>
                <td class="crop-cell">{{ crop.phos }}</td>
                <td class="crop-cell">{{ crop.sed }}</td>
              </tr>
            </table>

            <q-select
              v-model="crop.bmpSelect"
              :options="bmpOptions"
              dense
              multiple
              outlined
              label="Select Best Management Practice(s)"
              @update:model-value="buildField(crop.bmpSelect, crop.label)"
            />

            <div :id="crop.bmpSelect"></div>
          </q-expansion-item>
        </div>
      </div>
      <div style="display:flex; width:fit-content; margin:auto;">
        <q-btn class="q-ma-sm" color="primary" @click="backButton()"
          >Back</q-btn
        >
        <q-btn class="q-ma-sm" color="primary" @click="this.startReport = true"
          >Create Report</q-btn
        >
      </div>
    </div>
    <!-- Page where report creation is initiated -->
    <!-- <div></div> -->
  </div>
</template>

<script>
import IconButton from '../UI/IconButton.vue';

export default {
  name: 'tab3',
  components: { IconButton },
  data() {
    return {
      resourceVis: false,
      scale: '',
      scaleOptions: [
        { label: 'Agricultural Fields', value: 'Agricultural Fields' },
        { label: 'Poultry Production', value: 'Poultry Production' },
        { label: 'Dairy Production', value: 'Dairy Production' },
      ],
      layerOptions: [
        { label: 'Resource Units', value: 'NRCS Resource Units' },
        { label: 'HUC 12', value: '12-Digit Hydrologic Units' },
        { label: 'Catchments', value: 'Catchments' },
        { label: 'Agricultural Fields', value: 'Field Boundaries' },
      ],
      reference: 'Agricultural Fields',
      finalData: [],
      allSourcesTable: [],
      cropComponents: {},
      cropsFinalData: [],
      cropData: {},
      bmpSelect: [],
      bmpComponents: [],
      bmpOptions: [
        {
          label: 'Load Source Change BMPs (Full Coverage)',
          type: 'title',
          disable: true,
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Land Retirement',
          type: 'full',
          value: 'Land Retirement',
          nit: 0.89,
          phos: 0.8,
          sed: 0.95,
          phos_em: 0.27,
          nit_em: 0.1,
          cm_factor: 0.01,
          sp_factor: 1,
          area_percent: 0,
          remove: function() {
            this.removeBmp('Land Retirement');
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Pasture and Hayland Planting (Forage Planting)',
          type: 'full',
          value: 'Pasture and Hayland Planting (Forage Planting)',
          nit: 0.18,
          phos: 0.15,
          sed: 0,
          phos_em: 0.2,
          nit_em: 0.11,
          cm_factor: 0.007,
          sp_factor: 1,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Load Source Change BMPs (Defined Area)',
          type: 'title',
          disable: true,
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Buffer - Forest (100 ft wide)',
          type: 'defined',
          value: 'Buffer - Forest (100 ft wide)',
          nit: 0.47,
          phos: 0.46,
          sed: 0.58,
          phos_em: 0.4,
          nit_em: 0.1,
          cm_factor: 0.003,
          sp_factor: 1,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Buffer - Grass (35 ft wide)',
          type: 'defined',
          value: 'Buffer - Grass (35 ft wide)',
          nit: 0.33,
          phos: 0.43,
          sed: 0.53,
          phos_em: 0.2,
          nit_em: 0.11,
          cm_factor: 0.007,
          sp_factor: 1,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: '30m Buffer with Optional Grazing',
          type: 'defined',
          value: '30m Buffer with Optional Grazing',
          nit: 0.36,
          phos: 0.65,
          sed: 0,
          phos_em: 0.2,
          nit_em: 0.11,
          cm_factor: 0.007,
          sp_factor: 1,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Critical Area Planting',
          type: 'defined',
          value: 'Critical Area Planting',
          nit: 0.17,
          phos: 0.2,
          sed: 0.42,
          phos_em: 0.27,
          nit_em: 0.1,
          cm_factor: 0.01,
          sp_factor: 1,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Forest Buffer (min. 35 ft wide)',
          type: 'defined',
          value: 'Forest Buffer (min. 35 ft wide)',
          nit: 0.45,
          phos: 0.4,
          sed: 0.53,
          phos_em: 0.4,
          nit_em: 0.1,
          cm_factor: 0.003,
          sp_factor: 1,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Grass Buffer (min. 35 ft wide)',
          type: 'defined',
          value: 'Grass Buffer (min. 35 ft wide)',
          nit: 0.86,
          phos: 0.76,
          sed: 0.64,
          phos_em: 0.2,
          nit_em: 0.11,
          cm_factor: 0.007,
          sp_factor: 1,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Wetland Restoration',
          type: 'defined',
          value: 'Wetland Restoration',
          nit: 0.42,
          phos: 0.41,
          sed: 0.31,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Exclusive BMPs',
          type: 'title',
          disable: true,
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Conservation Tillage 1 (30%-59% Residue)',
          type: 'exclusive',
          value: 'Conservation Tillage 1 (30%-59% Residue)',
          nit: 0.15,
          phos: 0.35,
          sed: 0.4,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Conservation TIllage 2 (>= 60% Residue)',
          type: 'exclusive',
          value: 'Conservation TIllage 2 (>= 60% Residue)',
          nit: 0.25,
          phos: 0.68,
          sed: 0.77,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Contour Farming',
          type: 'exclusive',
          value: 'Contour Farming',
          nit: 0.27,
          phos: 0.39,
          sed: 0.34,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Terrace',
          type: 'exclusive',
          value: 'Terrace',
          nit: 0.25,
          phos: 0.3,
          sed: 0.4,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Overlapping BMPs',
          type: 'title',
          disable: true,
          nit: 0,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Bioreactor',
          type: 'overlapping',
          value: 'Bioreactor',
          nit: 0.45,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Controlled Drainage',
          type: 'overlapping',
          value: 'Controlled Drainage',
          nit: 0.38,
          phos: 0.35,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label:
            'Cover Crop 1 (Group A Commodity) (High Till only for Sediment)',
          type: 'overlapping',
          value:
            'Cover Crop 1 (Group A Commodity) (High Till only for Sediment)',
          nit: 0.008,
          phos: 0,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label:
            'Cover Crop 2 (Group A Traditional Normal Planting Time) (High Till only for TP and Sediment)',
          type: 'overlapping',
          value:
            'Cover Crop 2 (Group A Traditional Normal Planting Time) (High Till only for TP and Sediment)',
          nit: 0.19,
          phos: 0.07,
          sed: 0.1,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label:
            'Cover Crop 3 (Group A Traditional Early Planting Time) (High Till only for TP and Sediment)',
          type: 'overlapping',
          value:
            'Cover Crop 3 (Group A Traditional Early Planting Time) (High Till only for TP and Sediment)',
          nit: 0.2,
          phos: 0.15,
          sed: 0.2,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Nutrient Management 1 (Determined Rate)',
          type: 'overlapping',
          value: 'Nutrient Management 1 (Determined Rate)',
          nit: 0.15,
          phos: 0.45,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label:
            'Nutrient Management 2 (Determined Rate Plus Additional Considerations)',
          type: 'overlapping',
          value:
            'Nutrient Management 2 (Determined Rate Plus Additional Considerations)',
          nit: 0.24,
          phos: 0.56,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Two-Stage Ditch',
          type: 'overlapping',
          value: 'Two-Stage Ditch',
          nit: 0.12,
          phos: 0.28,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label:
            'Grazing Land Management (Rotational Grazing with Fenced Areas)',
          type: 'overlapping',
          value:
            'Grazing Land Management (Rotational Grazing with Fenced Areas)',
          nit: 0.43,
          phos: 0.26,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Heavy Use Area Protection',
          type: 'overlapping',
          value: 'Heavy Use Area Protection',
          nit: 0.18,
          phos: 0.19,
          sed: 0.33,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Litter Storage and Management',
          type: 'overlapping',
          value: 'Litter Storage and Management',
          nit: 0.14,
          phos: 0.14,
          sed: 0,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Livestock Exclusion Fencing',
          type: 'overlapping',
          value: 'Livestock Exclusion Fencing',
          nit: 0.2,
          phos: 0.3,
          sed: 0.62,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Prescribed Grazing',
          type: 'overlapping',
          value: 'Prescribed Grazing',
          nit: 0.4,
          phos: 0.22,
          sed: 0.33,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Steambank Protection w/o Fencing',
          type: 'overlapping',
          value: 'Steambank Protection w/o Fencing',
          nit: 0.15,
          phos: 0.22,
          sed: 0.57,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Steambank Stabilization and Fencing',
          type: 'overlapping',
          value: 'Steambank Stabilization and Fencing',
          nit: 0.75,
          phos: 0.75,
          sed: 0.75,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
        {
          label: 'Use Exclusion',
          type: 'overlapping',
          value: 'Use Exclusion',
          nit: 0.39,
          phos: 0.04,
          sed: 0.58,
          phos_em: 0,
          nit_em: 0,
          cm_factor: 0,
          sp_factor: 0,
          area_percent: 0,
          remove: function() {
            this.bmpSelect.forEach((bmp) => {
              if (bmp.label === this.label) {
                this.bmpSelect.splice(bmp);
              }
            });
          },
          toggle: function() {
            console.log('this is the toggle button');
          },
        },
      ],
      cropNewLoadNit: 0,
      cropNewLoadPhos: 0,
      cropNewLoadSed: 0,
      totalNewLoadNit: 0,
      totalNewLoadPhos: 0,
      totalNewLoadSed: 0,
      finalLayer: '',
      reducNit: 0,
      reducPhos: 0,
      reducSed: 0,
    };
  },
  methods: {
    // checkClick(event) {
    //   if (event.length > 0) {
    //     this.scale = [event.pop()];
    //   }
    // },
    extractData() {
      if (this.scale === 'NRCS Resource Units') {
        // console.log(this.resourceUnits);

        this.resourceUnits.forEach((a) => {
          this.totalNitr += a.nitr;
          this.totalPhos += a.phos;
          this.totalSed += a.sed;
          this.totalCropArea += a.cAcres;

          console.log(this.totalCropArea);

          this.allSourcesTable.push({
            acres: this.totalCropArea,
            nitr: this.totalNitr,
            sed: this.totalSed,
            phos: this.totalPhos,
          });

          const cropName = a.label;

          if (
            Object.prototype.hasOwnProperty.call(this.cropComponents, cropName)
          ) {
            this.cropComponents[cropName].push(a);
          } else {
            this.cropComponents[cropName] = [a];
          }

          for (const arrayName in this.cropComponents) {
            const array = this.cropComponents[arrayName];
            const label = array[0].label;
            let n = 0;
            let p = 0;
            let s = 0;
            let a = 0;

            for (const obj of array) {
              n += obj.nitr;
              p += obj.phos;
              s += obj.sed;
              a += obj.cAcres;
            }

            const newObj = { label, n, p, s, a };

            this.cropData[arrayName] = newObj;
          }
        });
      } else if (this.scale === '12-Digit Hydrologic Units') {
        console.log(this.hucUnits);

        this.hucUnits.forEach((a) => {
          this.totalNitr += a.nitr;
          this.totalPhos += a.phos;
          this.totalSed += a.sed;
          this.totalCropArea += a.cAcres;

          this.allSourcesTable.push({
            acres: this.totalCropArea.toLocaleString('en-US'),
            nitr: this.totalNitr,
            sed: this.totalSed,
            phos: this.totalPhos,
          });

          const cropName = a.label;

          if (
            Object.prototype.hasOwnProperty.call(this.cropComponents, cropName)
          ) {
            this.cropComponents[cropName].push(a);
          } else {
            this.cropComponents[cropName] = [a];
          }

          for (const arrayName in this.cropComponents) {
            const array = this.cropComponents[arrayName];
            const label = array[0].label;
            let n = 0;
            let p = 0;
            let s = 0;
            let a = 0;

            for (const obj of array) {
              n += obj.nitr;
              p += obj.phos;
              s += obj.sed;
              a += obj.cAcres;
            }

            const newObj = { label, n, p, s, a };

            this.cropData[arrayName] = newObj;
          }
        });
      } else if (this.scale === 'Catchments') {
        // console.log(this.hucUnits);

        this.catchUnits.forEach((a) => {
          this.totalNitr += a.nitr;
          this.totalPhos += a.phos;
          this.totalSed += a.sed;
          this.totalCropArea += a.cAcres;

          this.allSourcesTable.push({
            acres: this.totalCropArea.toLocaleString('en-US'),
            nitr: this.totalNitr,
            sed: this.totalSed,
            phos: this.totalPhos,
          });

          const cropName = a.label;

          if (
            Object.prototype.hasOwnProperty.call(this.cropComponents, cropName)
          ) {
            this.cropComponents[cropName].push(a);
          } else {
            this.cropComponents[cropName] = [a];
          }

          for (const arrayName in this.cropComponents) {
            const array = this.cropComponents[arrayName];
            const label = array[0].label;
            let n = 0;
            let p = 0;
            let s = 0;
            let a = 0;

            for (const obj of array) {
              n += obj.nitr;
              p += obj.phos;
              s += obj.sed;
              a += obj.cAcres;
            }

            const newObj = { label, n, p, s, a };

            this.cropData[arrayName] = newObj;
          }
        });
      } else if (this.scale === 'Field Boundaries') {
        // console.log(this.hucUnits);

        this.fieldUnits.forEach((a) => {
          this.totalNitr += a.nitr;
          this.totalPhos += a.phos;
          this.totalSed += a.sed;
          this.totalCropArea += a.cAcres;

          this.allSourcesTable.push({
            acres: this.totalCropArea.toLocaleString('en-US'),
            nitr: this.totalNitr,
            sed: this.totalSed,
            phos: this.totalPhos,
          });

          const cropName = a.label;

          if (
            Object.prototype.hasOwnProperty.call(this.cropComponents, cropName)
          ) {
            this.cropComponents[cropName].push(a);
          } else {
            this.cropComponents[cropName] = [a];
          }

          for (const arrayName in this.cropComponents) {
            const array = this.cropComponents[arrayName];
            const label = array[0].label;
            let n = 0;
            let p = 0;
            let s = 0;
            let a = 0;

            for (const obj of array) {
              n += obj.nitr;
              p += obj.phos;
              s += obj.sed;
              a += obj.cAcres;
            }

            const newObj = { label, n, p, s, a };

            this.cropData[arrayName] = newObj;
          }
        });
      }
    },
    buildNrcs(val, crop) {
      this.bmpSelect = [];

      let final = val[val.length - 1];
      let code = ``;
      console.log(crop.newNitr);

      if (!this.bmpSelect.includes(final)) {
        this.bmpSelect.push(final);
      }

      this.bmpSelect.forEach((bmp) => {
        console.log(bmp);
        if (bmp.type === 'full') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">Land Retirement</p>
                    <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                    <table>
                      <tr>
                        <th>Nit</th>
                        <th>Phos</th>
                        <th>Sed</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Event Mean Concentration (mg/L):
                    </p>
                    <table style="margin: auto; width: fit-content;">
                      <tr>
                        <th>Phos</th>
                        <th>Nit</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.phos_em +
            `" style="width: 50px" disabled />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.nit_em +
            `" style="width: 50px" disabled />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Sediment Management for BMP Area:
                    </p>
                    <p style="margin: 5px 0 0; margin: auto; width: fit-content;">
                      Cover-Management Factor:
                      <input
                        type="text"
                        value="` +
            bmp.cm_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                    <p style="margin: 0 0 5px; margin: auto; width: fit-content;">
                      Support Practice Factor:
                      <input
                        type="text"
                        value="` +
            bmp.sp_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button id="removeBtn" style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;

          this.cropNewLoadNit += crop.nitr - crop.nitr * bmp.nit;
          this.cropNewLoadPhos += crop.phos - crop.phos * bmp.phos;
          this.cropNewLoadSed += crop.sed - crop.sed * bmp.sed;

          this.reducNit += bmp.nit * 100;
          this.reducPhos += bmp.phos * 100;
          this.reducSed += bmp.sed * 100;
        } else if (bmp.type === 'defined') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">Buffer - Forest (100 ft wide)</p>
                    <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                    <table>
                      <tr>
                        <th>Nit</th>
                        <th>Phos</th>
                        <th>Sed</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Event Mean Concentration (mg/L):
                    </p>
                    <table style="margin: auto; width: fit-content;">
                      <tr>
                        <th>Phos</th>
                        <th>Nit</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.phos_em +
            `" style="width: 50px" disabled />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.nit_em +
            `" style="width: 50px" disabled />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Sediment Management for BMP Area:
                    </p>
                    <p style="margin: 5px 0 0; margin: auto; width: fit-content;">
                      Cover-Management Factor:
                      <input
                        type="text"
                        value="` +
            bmp.cm_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                    <p style="margin: 0 0 5px; margin: auto; width: fit-content;">
                      Support Practice Factor:
                      <input
                        type="text"
                        value="` +
            bmp.sp_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                  </div>
                  <div>
                    <p style="margin: 5px 0 5px; margin: auto; width: fit-content;">
                      Area to apply BMP (%):
                      <input type="text" value="` +
            bmp.area_percent +
            `" style="width: 50px;" />
                    </p>
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'exclusive') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <p style="margin: 5px 0 5px">Conservation Tillage 1 (30%-59% Residue)</p>
                  <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                  <table>
                    <tr>
                      <th>Nit</th>
                      <th>Phos</th>
                      <th>Sed</th>
                    </tr>
                    <tr>
                      <td>
                        <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                      </td>
                    </tr>
                  </table>

                  <div>
                    <p style="margin: 5px 0 5px">Area to apply BMP (%):</p>
                    <input
                      type="text"
                      value="` +
            bmp.area_percent +
            `"
                      style="width: 50px; margin:auto; display:block;"
                    />
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'overlapping') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <p style="margin: 5px 0 5px">Bioreactor</p>
                  <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                  <table>
                    <tr>
                      <th>Nit</th>
                      <th>Phos</th>
                      <th>Sed</th>
                    </tr>
                    <tr>
                      <td>
                        <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        }

        const bmpDiv = document.createElement('div');
        bmpDiv.setAttribute('id', crop.label);
        let bmpContainer = document.getElementById(crop.label);
        bmpDiv.innerHTML = code;
        bmpContainer.appendChild(bmpDiv);

        // let remove = document.getElementById('removeBtn');
        // remove.addEventListener('click', this.removeBmp(bmp));
      });
    },
    buildHuc(val, crop) {
      this.bmpSelect = [];

      let final = val[val.length - 1];
      let code = ``;

      if (!this.bmpSelect.includes(final)) {
        this.bmpSelect.push(final);
      }

      this.bmpSelect.forEach((bmp) => {
        if (bmp.type === 'full') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">Land Retirement</p>
                    <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                    <table>
                      <tr>
                        <th>Nit</th>
                        <th>Phos</th>
                        <th>Sed</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Event Mean Concentration (mg/L):
                    </p>
                    <table style="margin: auto; width: fit-content;">
                      <tr>
                        <th>Phos</th>
                        <th>Nit</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.phos_em +
            `" style="width: 50px" disabled />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.nit_em +
            `" style="width: 50px" disabled />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Sediment Management for BMP Area:
                    </p>
                    <p style="margin: 5px 0 0; margin: auto; width: fit-content;">
                      Cover-Management Factor:
                      <input
                        type="text"
                        value="` +
            bmp.cm_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                    <p style="margin: 0 0 5px; margin: auto; width: fit-content;">
                      Support Practice Factor:
                      <input
                        type="text"
                        value="` +
            bmp.sp_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px" onclick="">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'defined') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">Buffer - Forest (100 ft wide)</p>
                    <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                    <table>
                      <tr>
                        <th>Nit</th>
                        <th>Phos</th>
                        <th>Sed</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Event Mean Concentration (mg/L):
                    </p>
                    <table style="margin: auto; width: fit-content;">
                      <tr>
                        <th>Phos</th>
                        <th>Nit</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.phos_em +
            `" style="width: 50px" disabled />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.nit_em +
            `" style="width: 50px" disabled />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Sediment Management for BMP Area:
                    </p>
                    <p style="margin: 5px 0 0; margin: auto; width: fit-content;">
                      Cover-Management Factor:
                      <input
                        type="text"
                        value="` +
            bmp.cm_factor +
            `" style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                    <p style="margin: 0 0 5px; margin: auto; width: fit-content;">
                      Support Practice Factor:
                      <input
                        type="text"
                        value="` +
            bmp.sp_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                  </div>
                  <div>
                    <p style="margin: 5px 0 5px; margin: auto; width: fit-content;">
                      Area to apply BMP (%):
                      <input type="text" value="` +
            bmp.area_percent +
            `" style="width: 50px;" />
                    </p>
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'exclusive') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <p style="margin: 5px 0 5px">Conservation Tillage 1 (30%-59% Residue)</p>
                  <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                  <table>
                    <tr>
                      <th>Nit</th>
                      <th>Phos</th>
                      <th>Sed</th>
                    </tr>
                    <tr>
                      <td>
                        <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                      </td>
                    </tr>
                  </table>

                  <div>
                    <p style="margin: 5px 0 5px">Area to apply BMP (%):</p>
                    <input
                      type="text"
                      value="` +
            bmp.area_percent +
            `"
                      style="width: 50px; margin:auto; display:block;"
                    />
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'overlapping') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <p style="margin: 5px 0 5px">Bioreactor</p>
                  <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                  <table>
                    <tr>
                      <th>Nit</th>
                      <th>Phos</th>
                      <th>Sed</th>
                    </tr>
                    <tr>
                      <td>
                        <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        }

        const bmpDiv = document.createElement('div');
        bmpDiv.setAttribute('id', crop.label);
        let bmpContainer = document.getElementById(crop.label);
        bmpDiv.innerHTML = code;
        bmpContainer.appendChild(bmpDiv);
        // const removeButton = document.getElementById('removeButton');
        // removeButton.addEventListener('click', bmp.remove);
      });
    },
    buildCatch(val, crop) {
      this.bmpSelect = [];

      let final = val[val.length - 1];
      let code = ``;

      if (!this.bmpSelect.includes(final)) {
        this.bmpSelect.push(final);
      }

      this.bmpSelect.forEach((bmp) => {
        if (bmp.type === 'full') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">Land Retirement</p>
                    <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                    <table>
                      <tr>
                        <th>Nit</th>
                        <th>Phos</th>
                        <th>Sed</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Event Mean Concentration (mg/L):
                    </p>
                    <table style="margin: auto; width: fit-content;">
                      <tr>
                        <th>Phos</th>
                        <th>Nit</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.phos_em +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.nit_em +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Sediment Management for BMP Area:
                    </p>
                    <p style="margin: 5px 0 0; margin: auto; width: fit-content;">
                      Cover-Management Factor:
                      <input
                        type="text"
                        value="` +
            bmp.cm_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                    <p style="margin: 0 0 5px; margin: auto; width: fit-content;">
                      Support Practice Factor:
                      <input
                        type="text"
                        value="` +
            bmp.sp_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px" onclick="">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'defined') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">Buffer - Forest (100 ft wide)</p>
                    <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                    <table>
                      <tr>
                        <th>Nit</th>
                        <th>Phos</th>
                        <th>Sed</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Event Mean Concentration (mg/L):
                    </p>
                    <table style="margin: auto; width: fit-content;">
                      <tr>
                        <th>Phos</th>
                        <th>Nit</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.phos_em +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.nit_em +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Sediment Management for BMP Area:
                    </p>
                    <p style="margin: 5px 0 0; margin: auto; width: fit-content;">
                      Cover-Management Factor:
                      <input
                        type="text"
                        value="` +
            bmp.cm_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                    <p style="margin: 0 0 5px; margin: auto; width: fit-content;">
                      Support Practice Factor:
                      <input
                        type="text"
                        value="` +
            bmp.sp_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                  </div>
                  <div>
                    <p style="margin: 5px 0 5px; margin: auto; width: fit-content;">
                      Area to apply BMP (%):
                      <input type="text" value="` +
            bmp.area_percent +
            `" style="width: 50px;" />
                    </p>
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'exclusive') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <p style="margin: 5px 0 5px">Conservation Tillage 1 (30%-59% Residue)</p>
                  <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                  <table>
                    <tr>
                      <th>Nit</th>
                      <th>Phos</th>
                      <th>Sed</th>
                    </tr>
                    <tr>
                      <td>
                        <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                      </td>
                    </tr>
                  </table>

                  <div>
                    <p style="margin: 5px 0 5px">Area to apply BMP (%):</p>
                    <input
                      type="text"
                      value="` +
            bmp.area_percent +
            `"
                      style="width: 50px; margin:auto; display:block;"
                    />
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'overlapping') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <p style="margin: 5px 0 5px">Bioreactor</p>
                  <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                  <table>
                    <tr>
                      <th>Nit</th>
                      <th>Phos</th>
                      <th>Sed</th>
                    </tr>
                    <tr>
                      <td>
                        <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        }

        const bmpDiv = document.createElement('div');
        bmpDiv.setAttribute('id', crop.label);
        let bmpContainer = document.getElementById(crop.label);
        bmpDiv.innerHTML = code;
        bmpContainer.appendChild(bmpDiv);
        // const removeButton = document.getElementById('removeButton');
        // removeButton.addEventListener('click', bmp.remove);
      });
    },
    buildField(val, crop) {
      this.bmpSelect = [];

      let final = val[val.length - 1];
      let code = ``;

      if (!this.bmpSelect.includes(final)) {
        this.bmpSelect.push(final);
      }

      this.bmpSelect.forEach((bmp) => {
        if (bmp.type === 'full') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">Land Retirement</p>
                    <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                    <table>
                      <tr>
                        <th>Nit</th>
                        <th>Phos</th>
                        <th>Sed</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Event Mean Concentration (mg/L):
                    </p>
                    <table style="margin: auto; width: fit-content;">
                      <tr>
                        <th>Phos</th>
                        <th>Nit</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.phos_em +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.nit_em +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Sediment Management for BMP Area:
                    </p>
                    <p style="margin: 5px 0 0; margin: auto; width: fit-content;">
                      Cover-Management Factor:
                      <input
                        type="text"
                        value="` +
            bmp.cm_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                    <p style="margin: 0 0 5px; margin: auto; width: fit-content;">
                      Support Practice Factor:
                      <input
                        type="text"
                        value="` +
            bmp.sp_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button id="removeBtn" style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'defined') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">Buffer - Forest (100 ft wide)</p>
                    <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                    <table>
                      <tr>
                        <th>Nit</th>
                        <th>Phos</th>
                        <th>Sed</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Event Mean Concentration (mg/L):
                    </p>
                    <table style="margin: auto; width: fit-content;">
                      <tr>
                        <th>Phos</th>
                        <th>Nit</th>
                      </tr>
                      <tr>
                        <td>
                          <input type="text" value="` +
            bmp.phos_em +
            `" style="width: 50px" />
                        </td>
                        <td>
                          <input type="text" value="` +
            bmp.nit_em +
            `" style="width: 50px" />
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin: auto; width: fit-content;">
                    <p style="margin: 5px 0 5px">
                      Sediment Management for BMP Area:
                    </p>
                    <p style="margin: 5px 0 0; margin: auto; width: fit-content;">
                      Cover-Management Factor:
                      <input
                        type="text"
                        value="` +
            bmp.cm_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                    <p style="margin: 0 0 5px; margin: auto; width: fit-content;">
                      Support Practice Factor:
                      <input
                        type="text"
                        value="` +
            bmp.sp_factor +
            `"
                        style="width: 50px; margin-bottom: 5px"
                      />
                    </p>
                  </div>
                  <div>
                    <p style="margin: 5px 0 5px; margin: auto; width: fit-content;">
                      Area to apply BMP (%):
                      <input type="text" value="` +
            bmp.area_percent +
            `" style="width: 50px;" />
                    </p>
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'exclusive') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <p style="margin: 5px 0 5px">Conservation Tillage 1 (30%-59% Residue)</p>
                  <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                  <table>
                    <tr>
                      <th>Nit</th>
                      <th>Phos</th>
                      <th>Sed</th>
                    </tr>
                    <tr>
                      <td>
                        <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                      </td>
                    </tr>
                  </table>

                  <div>
                    <p style="margin: 5px 0 5px">Area to apply BMP (%):</p>
                    <input
                      type="text"
                      value="` +
            bmp.area_percent +
            `"
                      style="width: 50px; margin:auto; display:block;"
                    />
                  </div>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        } else if (bmp.type === 'overlapping') {
          code =
            `<div id="` +
            bmp.label +
            `">
            <div
              class="my-card bg-grey-3"
              style="width: fit-content; margin: auto; display: block; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <div style="margin: auto; width: fit-content;">
                <div>
                  <p style="margin: 5px 0 5px">Bioreactor</p>
                  <p style="margin: 5px 0 5px">Efficiencies (%):</p>
                  <table>
                    <tr>
                      <th>Nit</th>
                      <th>Phos</th>
                      <th>Sed</th>
                    </tr>
                    <tr>
                      <td>
                        <input type="text" value="` +
            bmp.nit +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.phos +
            `" style="width: 50px" />
                      </td>
                      <td>
                        <input type="text" value="` +
            bmp.sed +
            `" style="width: 50px" />
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div style="width: fit-content; display: block; margin: auto;">
                <button style="margin: 5px">Remove</button>
                <button style="margin: 5px">Toggle</button>
              </div>
            </div>
          </div>`;
        }

        const bmpDiv = document.createElement('div');
        bmpDiv.setAttribute('id', crop.label);
        let bmpContainer = document.getElementById(crop.label);
        bmpDiv.innerHTML = code;
        bmpContainer.appendChild(bmpDiv);

        // const removeButton = document.getElementById('removeButton');
        // removeButton.addEventListener('click', bmp.remove);
      });
    },
    removeBmp(val) {
      let bmp = document.getElementById(val);

      console.log(val);
      console.log('removeBmp method activated');

      if (bmp) {
        bmp.remove();
      }
    },
    // toggleBmp() {
    //   this.bmpSelect.forEach((bmp) => {
    //     if (bmp.label === )
    //   })
    // },
    backButton() {
      this.mngmtVis = false;
      this.count = 0;
      this.totalCropArea = 0;
      this.totalNitr - 0;
      this.totalPhos - 0;
      this.totalSed - 0;
    },
    unitRemoved(val) {
      this.unitIndex = this.unitSelection.indexOf(val);
      if (this.unitIndex !== -1) {
        this.unitSelection.splice(this.unitIndex, 1);
      }
      console.log(this.unitSelection);
    },
  },
  computed: {
    layerSelection: {
      get() {
        return this.$store.state.layerSelection;
      },
      set(value) {
        this.$store.commit('updateLayerSelection', value);
      },
    },
    referenceSelection: {
      get() {
        return this.$store.state.referenceSelection;
      },
      set(value) {
        this.$store.commit('updateReferenceSelection', value);
      },
    },
    unitSelection: {
      get() {
        return this.$store.state.unitSelection;
      },
      set(value) {
        this.$store.commit('updateUnitSelection', value);
      },
    },
    unitLength() {
      return this.$store.state.unitLength;
    },
    loadingVis: {
      get() {
        return this.$store.state.loadingVis;
      },
      set(value) {
        this.$store.commit('updateLoadingVis', value);
      },
    },
    mngmtVis: {
      get() {
        return this.$store.state.mngmtVis;
      },
      set(value) {
        this.$store.commit('updateMngmtVis', value);
      },
    },
    endLoading() {
      return this.$store.state.endLoading;
    },
    resourceUnits() {
      return this.$store.state.resourceUnits;
    },
    hucUnits() {
      return this.$store.state.hucUnits;
    },
    catchUnits() {
      return this.$store.state.catchUnits;
    },
    fieldUnits() {
      return this.$store.state.fieldUnits;
    },
    dataComplete() {
      return this.$store.state.dataComplete;
    },
    cropNames() {
      return Object.keys(this.cropComponents);
    },
    totalNitr: {
      get() {
        return this.$store.state.totalNitr;
      },
      set(value) {
        this.$store.commit('updateTotalNitr', value);
      },
    },
    totalPhos: {
      get() {
        return this.$store.state.totalPhos;
      },
      set(value) {
        this.$store.commit('updateTotalPhos', value);
      },
    },
    totalSed: {
      get() {
        return this.$store.state.totalSed;
      },
      set(value) {
        this.$store.commit('updateTotalSed', value);
      },
    },
    totalCropArea: {
      get() {
        return this.$store.state.totalCropArea;
      },
      set(value) {
        this.$store.commit('updateTotalCropArea', value);
      },
    },
    startReport: {
      get() {
        return this.$store.state.startReport;
      },
      set(value) {
        this.$store.commit('updateStartReport', value);
      },
    },
    backBtn: {
      get() {
        return this.$store.state.backBtn;
      },
      set(value) {
        this.$store.commit('updateBackBtn', value);
      },
    },
    count: {
      get() {
        return this.$store.state.count;
      },
      set(value) {
        this.$store.commit('updateCount', value);
      },
    },
    unitIndex: {
      get() {
        return this.$store.state.unitIndex;
      },
      set(value) {
        this.$store.commit('updateUnitIndex', value);
      },
    },
  },
  watch: {
    scale() {
      this.layerSelection = this.scale;
      this.finalLayer = this.scale;
    },
    reference() {
      console.log('reference selected');
      this.referenceSelection = this.reference;
      console.log(this.reference);
      console.log(this.referenceSelection);
    },
    endLoading() {
      if (this.endLoading === true) {
        this.loadingVis = false;
        this.mngmtVis = true;

        // this.extractData();
      }
    },
    bmpSelect() {
      // this.buildBmp();
      console.log('bmpSelect array has changed');
    },
    bmpOptions() {
      this.bmpOptions.forEach((bmp) => {
        console.log(bmp);
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#print-header {
  position: absolute;
  top: 0px;
  height: 30px;
}
#print-footer {
  position: absolute;
  bottom: 0px;
  height: 30px;
}
#print-map {
  position: absolute;
  top: 30px;
  height: 500px;
}
.selected-units {
  border: 1px solid black;
  border-radius: 4px;
}
.total-table,
.total-cell {
  border: 1px solid black;
  border-collapse: collapse;
  margin: 10px auto 10px auto;
  padding: 5px;
  width: auto;
}
.crop-table,
.crop-cell {
  border: 1px solid black;
  border-collapse: collapse;
  margin: 10px auto 10px auto;
  width: auto;
  padding: 2px 5px 2px 5px;
}
.q-item__label {
  margin-left: 30px;
}
</style>
