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
          </div>
        </div>
        <div
          class="selected-units text-bold q-pa-sm q-my-md"
          style="width:fit-content;margin:auto;"
        >
          Selected Units:
          <div style="display:grid;">
            <q-chip
              id="unit-chip"
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
          @click="this.loadingVis = true"
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
              <td class="total-cell">{{ this.totalNewLoadNit }}</td>
              <td class="total-cell">{{ this.totalNewLoadPhos }}</td>
              <td class="total-cell">{{ this.totalNewLoadSed }}</td>
            </tr>
            <tr>
              <th class="total-cell">Reduction:</th>
              <td class="total-cell">{{ this.totalReducedPercentNit }}%</td>
              <td class="total-cell">{{ this.totalReducedPercentPhos }}%</td>
              <td class="total-cell">{{ this.totalReducedPercentSed }}%</td>
            </tr>
          </table>
        </div>
      </div>

      <hr />
      <div v-if="this.finalLayer === 'NRCS Resource Units'">
        <div v-for="crop in this.initLoadData" :key="crop">
          <q-expansion-item
            :label="
              crop.label +
                ' ' +
                '-' +
                ' ' +
                crop.acres.toFixed(2) +
                ' ' +
                'acres'
            "
            v-if="this.nonCrop.includes(crop.label) == false"
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
                <td class="crop-cell">{{ crop.nitr.toFixed(2) }}</td>
                <td class="crop-cell">{{ crop.phos.toFixed(2) }}</td>
                <td class="crop-cell">{{ crop.sed.toFixed(2) }}</td>
              </tr>
              <tr>
                <th class="crop-cell">New Load (MT/yr):</th>
                <td class="crop-cell">{{ crop.newNitr }}</td>
                <td class="crop-cell">{{ crop.newPhos }}</td>
                <td class="crop-cell">{{ crop.newSed }}</td>
              </tr>
              <tr>
                <th class="crop-cell">Reduction:</th>
                <td class="crop-cell">{{ crop.nitrReducPercent }} %</td>
                <td class="crop-cell">{{ crop.phosReducPercent }} %</td>
                <td class="crop-cell">{{ crop.sedReducPercent }} %</td>
              </tr>
            </table>

            <!-- <q-select
              v-model="bmpSelect"
              :options="bmpOptions"
              dense
              multiple
              outlined
              label="Select Best Management Practice(s)"
              options-dense
              popup-content-style="margin-left: 30px"
              style="margin: 0 10px 0 10px;"
              counter
              option-disable="disable"
              @update:model-value="buildNrcs(bmpSelect, crop)"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label :style="scope.opt.color">{{
                      scope.opt.label
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div :id="crop.label" style="margin: 10px"></div>

            <div v-for="bmp in bmpSelect" :key="bmp">
              <bmp-full-component
                :bmp="bmp"
                remove="remove-bmp"
                v-if="bmp.style === crop.label"
                @remove-bmp="removeBmp(bmp, crop)"
                toggle="toggle-bmp"
                @toggle-bmp="toggleBmp(bmp, crop)"
              ></bmp-full-component>
            </div> -->
            <bmp-select-component
              :crop="crop"
              method="nrcs-build"
              @nrcs-build="console.log('build nrcs method activated')"
            ></bmp-select-component>
          </q-expansion-item>
        </div>
      </div>
      <div v-if="this.finalLayer === '12-Digit Hydrologic Units'">
        <div v-for="crop in this.hucUnits" :key="crop">
          <q-expansion-item
            :label="crop.label + ' ' + '-' + ' ' + crop.cAcres + ' ' + 'acres'"
            v-if="this.nonCrop.includes(crop.label) == false"
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
            v-if="this.nonCrop.includes(crop.label) == false"
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
            v-if="this.nonCrop.includes(crop.label) == false"
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

            <div :id="crop.bmpSelect" style="margin: 5px;"></div>

            <div></div>
          </q-expansion-item>
        </div>
      </div>
      <div style="display:flex; width:fit-content; margin:auto;">
        <q-btn class="q-ma-sm" color="primary" @click="backButton()"
          >Back</q-btn
        >
        <q-btn class="q-ma-sm" color="primary" @click="startPdf()"
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
// import bmpFullComponent from '../UI/bmpFullComponent.vue';
import bmpSelectComponent from '../UI/bmpSelectComponent.vue';

export default {
  name: 'louisiana-cda',
  components: { IconButton, bmpSelectComponent },
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
          style: '',
          color: 'color: black',
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
          lscFull: 'FullExtent',
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          lscFull: 'FullExtent',
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          color: 'color: black',
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
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'LSC',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          style: '',
          toggled: true,
          color: 'color: black',
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
          redFunc: 'E',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'EX',
          area_percent: 0,
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'EX',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          style: '',
          color: 'color: black',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
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
          redFunc: 'E',
          appType: 'OV',
          style: '',
          toggled: true,
          disable: false,
          color: 'color: blue',
        },
      ],
      cropNewLoadNit: 0,
      cropNewLoadPhos: 0,
      cropNewLoadSed: 0,
      finalLayer: '',
      reducNit: 0,
      reducPhos: 0,
      reducSed: 0,
      lscBMP: [],
      exBMP: [],
      ovBMP: [],
      nonCrop: [
        'Background',
        'Barren',
        'Deciduous Forest',
        'Evergreen Forest',
        'Herbaceous Wetlands',
        'Mixed Forest',
        'Open Water',
        'Shrubland',
        'Woody Wetlands',
        'Developed/Open Space',
        'Developed/Med Intensity',
        'Developed/Low Intensity',
        'Developed/High Intensity',
        'Aquaculture',
      ],
      groupedObjects: [],
      htmlCode: null,
      cropLabel: '',
      lsc_length: 0,
      ex_length: 0,
      ov_length: 0,
      lastBMP: '',
      lastBMPLabel: '',
      lastCrop: '',
      aa: '',
      totalsCalculated: false,
    };
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
    resourceUnits: {
      get() {
        return this.$store.state.resourceUnits;
      },
      set(value) {
        this.$store.commit('updateResourceUnits', value);
      },
    },
    hucUnits: {
      get() {
        return this.$store.state.hucUnits;
      },
      set(value) {
        this.$store.commit('updateHucUnits', value);
      },
    },
    catchUnits: {
      get() {
        return this.$store.state.catchUnits;
      },
      set(value) {
        this.$store.commit('updateCatchUnits', value);
      },
    },
    fieldUnits: {
      get() {
        return this.$store.state.fieldUnits;
      },
      set(value) {
        this.$store.commit('updateFieldUnits', value);
      },
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
    toggledOff: {
      get() {
        return this.$store.state.toggledOff;
      },
      set(value) {
        this.$store.commit('updateToggledOff', value);
      },
    },
    reportTotalTable: {
      get() {
        return this.$store.state.reportTotalTable;
      },
      set(value) {
        this.$store.commit('updateReportTotalTable', value);
      },
    },
    reportCropTables: {
      get() {
        return this.$store.state.reportCropTables;
      },
      set(value) {
        this.$store.commit('updateReportCropTables', value);
      },
    },
    totalNewLoadNit: {
      get() {
        return this.$store.state.totalNewLoadNit;
      },
      set(value) {
        this.$store.commit('updateTotalNewLoadNit', value);
      },
    },
    totalNewLoadPhos: {
      get() {
        return this.$store.state.totalNewLoadPhos;
      },
      set(value) {
        this.$store.commit('updateTotalNewLoadPhos', value);
      },
    },
    totalNewLoadSed: {
      get() {
        return this.$store.state.totalNewLoadSed;
      },
      set(value) {
        this.$store.commit('updateTotalNewLoadSed', value);
      },
    },
    totalReducedPercentNit: {
      get() {
        return this.$store.state.totalReducedPercentNit;
      },
      set(value) {
        this.$store.commit('updateTotalReducedPercentNit', value);
      },
    },
    totalReducedPercentPhos: {
      get() {
        return this.$store.state.totalReducedPercentPhos;
      },
      set(value) {
        this.$store.commit('updateTotalReducedPercentPhos', value);
      },
    },
    totalReducedPercentSed: {
      get() {
        return this.$store.state.totalReducedPercentSed;
      },
      set(value) {
        this.$store.commit('updateTotalReducedPercentSed', value);
      },
    },
    printMap: {
      get() {
        return this.$store.state.printMap;
      },
      set(value) {
        this.$store.commit('updatePrintMap', value);
      },
    },
    initLoadData() {
      return this.$store.state.initLoadData;
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
  },
  methods: {
    buildNrcs(array) {
      const val = array[0];
      const crop = array[1];
      let final = val[val.length - 1];
      this.lastBMP = final;
      this.cropLabel = crop.label;

      if (final.style == '') {
        final.style = crop.label;
      } else {
        final.style = crop.label;
      }

      if (!this.bmpSelect.includes(final) && !this.bmpAltered) {
        this.bmpSelect.push(final);
      }

      if (this.lastCrop !== crop) {
        this.lastCrop = crop;
      }

      if (this.lastBMPLabel) {
        if (this.lastBMPLabel !== final.label) {
          this.lastBMPLabel = final.label;
        }
      }

      this.calculateReducedLoads(crop);
    },
    buildHuc(val) {
      this.calculateReducedLoads(val);

      let final = val[val.length - 1];

      if (!this.bmpSelect.includes(final)) {
        this.bmpSelect.push(final);
      }
    },
    buildCatch(val) {
      this.calculateReducedLoads(val);

      let final = val[val.length - 1];

      if (!this.bmpSelect.includes(final)) {
        this.bmpSelect.push(final);
      }
    },
    buildField(val) {
      this.calculateReducedLoads(val);

      let final = val[val.length - 1];

      if (!this.bmpSelect.includes(final)) {
        this.bmpSelect.push(final);
      }
    },
    calculateReducedLoads(val) {
      this.newNitr = 0;
      this.newPhos = 0;
      this.newSed = 0;

      let lscBMP = [];
      let exBMP = [];
      let ovBMP = [];
      let bmp;

      console.log(this.bmpSelect);
      console.log(val);
      console.log(this.bmpAltered);

      if (this.bmpAltered !== {}) {
        bmp = this.bmpAltered;

        this.bmpSelect.forEach((a, i) => {
          if (a.label === bmp.label) {
            // this.bmpSelect.splice(a);
            // this.bmpSelect.push(bmp);
            this.bmpSelect[i] = bmp;
          }
        });
      }

      console.log(this.bmpSelect);

      this.bmpSelect.forEach((bmpSel) => {
        console.log(bmpSel);
        if (bmpSel.toggled == true) {
          if (bmpSel.redFunc === 'LSC') {
            if (bmpSel.area_percent > 0 || bmpSel.lscFull) {
              lscBMP.push(bmpSel);
            }
          }
          if (
            bmpSel.appType === 'EX' &&
            bmpSel.redFunc !== 'LSC' &&
            bmpSel.area_percent > 0
          ) {
            exBMP.push(bmpSel);
          }
          if (bmpSel.appType === 'OV') {
            ovBMP.push(bmpSel);
          }
        }
      });

      this.lsc_length = lscBMP.length;
      this.ex_length = exBMP.length;
      this.ov_length = ovBMP.length;

      console.log(this.lsc_length, this.ex_length, this.ov_length);

      // EX, OV, and LSC
      if (this.lsc_length > 0 && this.ex_length > 0 && this.ov_length > 0) {
        // nitrogen
        let nit1 = this.calculateLSCbmp1('nit', lscBMP);
        let nit_PFO =
          this.calculateEXbmp('nit', exBMP) * this.calculateOVbmp('nit', ovBMP);
        let nit2 = this.calculateLSCbmp2('nit', lscBMP, nit_PFO);

        // phos
        let phos1 = this.calculateLSCbmp1('phos', lscBMP);
        let phos_PFO =
          this.calculateEXbmp('phos', exBMP) *
          this.calculateOVbmp('phos', ovBMP);
        let phos2 = this.calculateLSCbmp2('phos', lscBMP, phos_PFO);

        //sediment
        let sed1 = this.calculateLSCbmp1('sed', lscBMP);
        let sed_PFO =
          this.calculateEXbmp('sed', exBMP) * this.calculateOVbmp('sed', ovBMP);
        let sed2 = this.calculateLSCbmp2('sed', lscBMP, sed_PFO);

        val.newNitr = nit1 + nit2;
        val.newPhos = phos1 + phos2;
        val.newSed = sed1 + sed2;
      }

      // OV and LSC
      if (this.lsc_length > 0 && this.ov_length > 0 && this.ex_length === 0) {
        // calculate the OV bmp's first and use as the pass through factor for calculating the LSC bmp
        // nitrogen
        let nit1 = this.calculateLSCbmp1('nit', lscBMP);
        let nit_PFO = this.calculateOVbmp('nit', ovBMP);
        let nit2 = this.calculateLSCbmp2('nit', lscBMP, nit_PFO);
        // phos calcs
        let phos1 = this.calculateLSCbmp1('phos', lscBMP);
        let phos_PFO = this.calculateOVbmp('phos', ovBMP);
        let phos2 = this.calculateLSCbmp2('phos', lscBMP, phos_PFO);
        // sed calcs
        let sed1 = this.calculateLSCbmp1('sed', lscBMP);
        let sed_PFO = this.calculateOVbmp('sed', ovBMP);
        let sed2 = this.calculateLSCbmp2('sed', lscBMP, sed_PFO);

        val.newNitr = nit1 + nit2;
        val.newPhos = phos1 + phos2;
        val.newSed = sed1 + sed2;
      }

      // EX and LSC
      if (this.ex_length > 0 && this.lsc_length > 0 && this.ov_length === 0) {
        // calculate the OV bmp's first and use as the pass through factor for calculating the LSC bmp
        // nitrogen
        let nit1 = this.calculateLSCbmp1('nit', lscBMP);
        let nit_PFO = this.calculateEXbmp('nit', exBMP);
        let nit2 = this.calculateLSCbmp2('nit', lscBMP, nit_PFO);
        // phos calcs
        let phos1 = this.calculateLSCbmp1('phos', lscBMP);
        let phos_PFO = this.calculateEXbmp('phos', exBMP);
        let phos2 = this.calculateLSCbmp2('phos', lscBMP, phos_PFO);
        // sed calcs
        let sed1 = this.calculateLSCbmp1('sed', lscBMP);
        let sed_PFO = this.calculateEXbmp('sed', exBMP);
        let sed2 = this.calculateLSCbmp2('sed', lscBMP, sed_PFO);

        val.newNitr = nit1 + nit2;
        val.newPhos = phos1 + phos2;
        val.newSed = sed1 + sed2;
      }

      // EX and OV - COMPLETE
      if (this.ex_length > 0 && this.ov_length > 0 && this.lsc_length === 0) {
        val.newNitr =
          val.nitr *
          this.calculateEXbmp('nit', exBMP) *
          this.calculateOVbmp('nit', ovBMP);

        val.newPhos =
          val.phos *
          this.calculateEXbmp('phos', exBMP) *
          this.calculateOVbmp('phos', ovBMP);

        val.newSed =
          val.sed *
          this.calculateEXbmp('sed', exBMP) *
          this.calculateOVbmp('sed', ovBMP);
      }
      // LSC only - COMPLETE
      if (this.lsc_length > 0 && this.ex_length === 0 && this.ov_length === 0) {
        // calc nit lsc reduced load
        let nit1 = this.calculateLSCbmp1('nit', lscBMP);
        let nit2 = this.calculateLSCbmp2('nit', lscBMP, 1);
        val.newNitr = nit1 + nit2;

        // calc phos lsc reduced load
        let phos1 = this.calculateLSCbmp1('phos', lscBMP);
        let phos2 = this.calculateLSCbmp2('phos', lscBMP, 1);
        val.newPhos = phos1 + phos2;

        // calc sed lsc reduced load
        let sed1 = this.calculateLSCbmp1('sed', lscBMP);
        let sed2 = this.calculateLSCbmp2('sed', lscBMP, 1);
        val.newSed = sed1 + sed2;

        console.log(nit1, nit2);
        console.log(val.newPhos, phos1, phos2);
      }

      // EX only - COMPLETE
      if (this.ex_length > 0 && this.lsc_length === 0 && this.ov_length === 0) {
        val.newNitr = val.nitr * this.calculateEXbmp('nit', exBMP);
        val.newPhos = val.phos * this.calculateEXbmp('phos', exBMP);
        val.newSed = val.sed * this.calculateEXbmp('sed', exBMP);
      }
      // OV only - COMPLETE
      if (this.ov_length > 0 && this.ex_length === 0 && this.lsc_length === 0) {
        val.newNitr = val.nitr * this.calculateOVbmp('nit', ovBMP);
        val.newPhos = val.phos * this.calculateOVbmp('phos', ovBMP);
        val.newSed = val.sed * this.calculateOVbmp('sed', ovBMP);
      }

      val.newNitr = parseFloat(val.newNitr).toFixed(2);
      if (val.newNitr > 0) {
        val.nitrReducPercent = (
          ((val.nitr - val.newNitr) / val.nitr) *
          100
        ).toFixed(0);
      } else {
        val.nitrReducPercent = 0;
      }

      val.newPhos = parseFloat(val.newPhos).toFixed(2);
      if (val.newPhos > 0) {
        val.phosReducPercent = (
          ((val.phos - val.newPhos) / val.phos) *
          100
        ).toFixed(0);
      } else {
        val.phosReducPercent = 0;
      }

      console.log(val.phos, val.newPhos, val.phosReducPercent);

      val.newSed = parseFloat(val.newSed).toFixed(2);
      if (val.newSed > 0) {
        val.sedReducPercent = (
          ((val.sed - val.newSed) / val.sed) *
          100
        ).toFixed(0);
      } else {
        val.sedReducPercent = 0;
      }

      this.bmpAltered = {};
      this.calculateTotals();
    },
    calculateTotals() {
      let selectedCrops;

      if (this.resourceUnits) {
        selectedCrops = this.resourceUnits;
      } else if (this.hucUnits) {
        selectedCrops = this.hucUnits;
      } else if (this.catchUnits) {
        selectedCrops = this.catchUnits;
      } else if (this.fieldUnits) {
        selectedCrops = this.fieldUnits;
      }

      this.totalNewLoadNit = 0;
      this.totalNewLoadPhos = 0;
      this.totalNewLoadSed = 0;

      this.totalReducedPercentNit = 0;
      this.totalReducedPercentPhos = 0;
      this.totalReducedPercentSed = 0;

      selectedCrops.forEach((crop) => {
        if (this.nonCrop.includes(crop.label) == false) {
          // this.totalCropArea += parseInt(crop.cAcres);
          if (crop.nitr) {
            if (crop.newNitr > 0) {
              this.totalNewLoadNit = (this.totalNewLoadNit +=
                crop.newNitr).toFixed(2);
            } else {
              this.totalNewLoadNit = this.totalNewLoadNit += crop.nitr;
            }
          }
          if (crop.phos) {
            if (crop.newPhos > 0) {
              this.totalNewLoadPhos = (this.totalNewLoadPhos +=
                crop.newPhos).toFixed(2);
            } else {
              this.totalNewLoadPhos = this.totalNewLoadPhos += crop.phos;
            }
          }
          if (crop.sed) {
            if (crop.newSed > 0) {
              this.totalNewLoadSed = (this.totalNewLoadSed +=
                crop.newSed).toFixed(2);
            } else {
              this.totalNewLoadSed = this.totalNewLoadSed += crop.sed;
            }
          }

          this.totalNewLoadNit = parseFloat(this.totalNewLoadNit.toFixed(2));
          this.totalNewLoadPhos = parseFloat(this.totalNewLoadPhos.toFixed(2));
          this.totalNewLoadSed = parseFloat(this.totalNewLoadSed.toFixed(2));
        }
      });

      this.totalReducedPercentNit = (
        ((this.totalNitr - this.totalNewLoadNit) / this.totalNitr) *
        100
      ).toFixed(0);

      this.totalReducedPercentPhos = (
        ((this.totalPhos - this.totalNewLoadPhos) / this.totalPhos) *
        100
      ).toFixed(0);

      this.totalReducedPercentSed = (
        ((this.totalSed - this.totalNewLoadSed) / this.totalSed) *
        100
      ).toFixed(0);

      this.totalsCalculated = true;
    },
    calculateEXbmp(type, array) {
      let PTF = 0;
      let eff_value = 0;
      // this.areaApplied = this.areaApplied / 100;
      const areaApplied = this.areaApplied / 100;

      array.forEach((bmp, index) => {
        if (type === 'nit') {
          eff_value = bmp.nit;
        } else if (type === 'phos') {
          eff_value = bmp.phos;
        } else if (type === 'sed') {
          eff_value = bmp.sed;
        }

        // console.log(this.areaApplied);
        // console.log(areaApplied);

        const overallCropArea = this.lastCrop.acres;
        const crop_area_applied = areaApplied * this.lastCrop.acres;

        // console.log(overallCropArea, crop_area_applied);

        if (index === 0) {
          PTF = (crop_area_applied / overallCropArea) * eff_value;
        } else {
          PTF += (crop_area_applied / overallCropArea) * eff_value;
        }
      });

      PTF = 1 - PTF;
      return PTF;
    },
    calculateOVbmp(type, array) {
      let PTF;
      let eff_value = 0;

      array.forEach((bmp, i) => {
        if (type === 'nit') {
          eff_value = bmp.nit;
        } else if (type === 'phos') {
          eff_value = bmp.phos;
        } else if (type === 'sed') {
          eff_value = bmp.sed;
        }

        if (i === 0) {
          PTF = parseFloat(1 - eff_value);
        } else {
          PTF *= parseFloat(1 - eff_value);
        }
      });

      return PTF;
    },
    calculateLSCbmp1(type, array) {
      let bmp = array[0];
      let percentApplied = bmp.area_percent;
      // if (!percentApplied) {
      //   percentApplied = 0;
      // }
      let cropRows;
      let rpl_lsc = 0;

      if (this.resourceUnits) {
        cropRows = this.resourceUnits;
      } else if (this.hucUnits) {
        cropRows = this.hucUnits;
      } else if (this.catchUnits) {
        cropRows = this.catchUnits;
      } else if (this.fieldUnits) {
        cropRows = this.fieldUnits;
      }

      cropRows.forEach((cropRow) => {
        if (this.cropLabel === cropRow.label) {
          let emc_bmp_value = 0;
          let eff_value = 0;
          let R = parseFloat(cropRow.runoff_in_yr);
          let r_factor_100_ton_acre = cropRow.rFactor;
          let k_factor = cropRow.k_factor;
          let cls_factor = cropRow.cls_factor;
          let c_bmp = bmp.cm_factor;
          let p_bmp = bmp.sp_factor;
          let applied_acres = percentApplied * parseFloat(cropRow.cAcres);

          console.log(eff_value);
          // console.log(cropRow);
          // console.log(R);
          // console.log(r_factor_100_ton_acre);
          // console.log(k_factor);
          // console.log(cls_factor);
          // console.log(c_bmp);
          // console.log(p_bmp);
          // console.log(applied_acres);

          if (type === 'nit') {
            emc_bmp_value = cropRow.nit_emc_value;
            eff_value = bmp.nit;

            rpl_lsc += emc_bmp_value * R * applied_acres * 0.000113;

            console.log(emc_bmp_value);
            console.log(eff_value);
            console.log(applied_acres);
          } else if (type === 'phos') {
            emc_bmp_value = cropRow.phos_emc_value;
            eff_value = bmp.phos;

            rpl_lsc += emc_bmp_value * R * applied_acres * 0.000113;
          } else if (type === 'sed') {
            rpl_lsc +=
              applied_acres *
              r_factor_100_ton_acre *
              k_factor *
              cls_factor *
              c_bmp *
              p_bmp;
          }
        }
      });

      return rpl_lsc;
    },
    calculateLSCbmp2(type, array, PTF) {
      let bmp = array[0];
      console.log(bmp);
      let percentApplied = bmp.area_percent;
      let cropRows;
      let rpl_non_lsc = 0;

      if (this.resourceUnits) {
        cropRows = this.resourceUnits;
      } else if (this.hucUnits) {
        cropRows = this.hucUnits;
      } else if (this.catchUnits) {
        cropRows = this.catchUnits;
      } else if (this.fieldUnits) {
        cropRows = this.fieldUnits;
      }

      cropRows.forEach((cropRow) => {
        if (this.cropLabel === cropRow.label) {
          let r_factor_100_ton_acre = cropRow.rFactor;
          let k_factor = cropRow.k_factor;
          let cls_factor = cropRow.cls_factor;
          let C = cropRow.c;
          let P = cropRow.p;

          let emc_crop_value = 0;
          let eff_value = 0;

          let R = parseFloat(cropRow.runoff_in_yr);
          let crop_area = cropRow.cAcres;

          // console.log(cropRow);
          // console.log(r_factor_100_ton_acre, 'r_factor');
          // console.log(k_factor, 'k_factor');
          // console.log(cls_factor, 'cls_factor');
          // console.log(C, 'c');
          // console.log(P, 'p');
          // console.log(R, 'r');
          // console.log(crop_area, 'crop_area');

          if (type === 'nit') {
            emc_crop_value = cropRow.nit_emc_value;
            eff_value = bmp.nit;
            rpl_non_lsc +=
              emc_crop_value *
              R *
              (crop_area - percentApplied * crop_area) *
              (1 - eff_value) *
              PTF *
              0.000113;
          } else if (type === 'phos') {
            emc_crop_value = cropRow.phos_emc_value;
            eff_value = bmp.phos;
            rpl_non_lsc +=
              emc_crop_value *
              R *
              (crop_area - percentApplied * crop_area) *
              (1 - eff_value) *
              PTF *
              0.000113;
          } else if (type === 'sed') {
            eff_value = bmp.sed;
            rpl_non_lsc +=
              (crop_area - percentApplied * crop_area) *
              r_factor_100_ton_acre *
              k_factor *
              cls_factor *
              C *
              P *
              (1 - eff_value) *
              PTF;
          }
        }
      });

      return rpl_non_lsc;
    },
    removeBmp(array) {
      let num = -1;
      const val = array[0];
      const crop = array[1];

      this.bmpSelect.forEach((bmp, index) => {
        if (bmp.value == val.value) {
          num = index;
        }
        bmp.disable = false;
      });
      this.bmpSelect.splice(num, 1);

      console.log(val);

      this.bmpOptions.forEach((a) => {
        if (val.type == 'full') {
          if (a.type !== 'title') {
            a.disable = false;
          }
        } else if (val.type == 'defined') {
          if (a.type == 'full' || a.type == 'defined') {
            if (a.type !== 'title') {
              a.disable = false;
            }
          }
        } else if (
          this.lastBMP.type == 'exclusive' ||
          this.lastBMP.type == 'overlapping'
        ) {
          if (a.disable == true) {
            a.disable = true;
          } else if (a.disable == false) {
            a.disable == false;
          }
        }
      });

      if (this.bmpSelect.length == 0) {
        crop.newNitr = 0;
        crop.newPhos = 0;
        crop.newSed = 0;
        crop.nitrReducPercent = 0;
        crop.phosReducPercent = 0;
        crop.sedReducPercent = 0;

        this.bmpSelect.forEach((a) => {
          a.disable = false;
        });
      } else {
        this.buildNrcs([this.bmpSelect, crop]);
      }

      this.toggledOff = !this.toggledOff;
    },
    toggleBmp(array) {
      const val = array[0];
      const crop = array[1];

      this.toggledOff = !this.toggledOff;

      if (val.toggled == false) {
        val.toggled = true;
      } else if (val.toggled == true) {
        val.toggled = false;
        crop.newNitr = 0;
        crop.newPhos = 0;
        crop.newSed = 0;
        crop.nitrReducPercent = 0;
        crop.phosReducPercent = 0;
        crop.sedReducPercent = 0;
      }

      if (this.finalLayer == 'NRCS Resource Units') {
        let bmp;

        if (this.bmpAltered) {
          bmp = this.bmpAltered;
        } else {
          bmp = this.lastBMP;
        }

        this.bmpSelect.forEach((a) => {
          if (a.label == bmp.label) {
            this.bmpSelect.splice(a);
            this.bmpSelect.push(bmp);
          }
        });

        console.log(this.bmpSelect);

        this.buildNrcs([this.bmpSelect, crop]);
      }
    },
    backButton() {
      this.mngmtVis = false;
      this.count = 0;
      this.totalCropArea = 0;
      this.totalNitr = 0;
      this.totalPhos = 0;
      this.totalSed = 0;
    },
    unitRemoved(val) {
      this.unitIndex = this.unitSelection.indexOf(val);
      if (this.unitIndex !== -1) {
        this.unitSelection.splice(this.unitIndex, 1);
      }
      console.log(this.unitSelection);
    },
    startPdf() {
      this.startReport = true;
      this.printMap = true;

      let totalTable = document.getElementsByClassName('total-table');
      this.reportTotalTable = totalTable;

      let cropTable = document.getElementsByClassName('crop-table');
      this.reportCropTables.push(cropTable);

      console.log(this.reportCropTables, this.reportTotalTable);
    },
    consolidateData() {
      const nonCrop = [
        'Background',
        'Barren',
        'Deciduous Forest',
        'Evergreen Forest',
        'Herbaceous Wetlands',
        'Mixed Forest',
        'Open Water',
        'Shrubland',
        'Woody Wetlands',
        'Developed/Open Space',
        'Developed/Med Intensity',
        'Developed/Low Intensity',
        'Developed/High Intensity',
        'Aquaculture',
      ];

      if (this.layerSelection === 'NRCS Resource Units') {
        this.resourceUnits.forEach((obj) => {
          const label = obj.label;
          if (!this.groupedObjects[label]) {
            this.groupedObjects[label] = {
              label,
              cAcres: 0,
              nitr: 0,
              phos: 0,
              sed: 0,
              rFactor: 0,
              k_factor: 0,
              cls_factor: 0,
              runoff_in_yr: 0,
              nit_emc_value: 0,
              phos_emc_value: 0,
              c: 0,
              p: 0,
              newNitr: 0,
              newPhos: 0,
              newSed: 0,
              nitrReducPercent: 0,
              phosReducPercent: 0,
              sedReducPercent: 0,
            };
          }
          this.groupedObjects[label].cAcres += obj.cAcres;
          this.groupedObjects[label].nitr += obj.nitr;
          this.groupedObjects[label].phos += obj.phos;
          this.groupedObjects[label].sed += obj.sed;
          this.groupedObjects[label].rFactor = obj.rFactor;
          this.groupedObjects[label].k_factor = obj.k_factor;
          this.groupedObjects[label].cls_factor = obj.cls_factor;
          this.groupedObjects[label].runoff_in_yr = obj.runoff_in_yr;
          this.groupedObjects[label].nit_emc_value = obj.nit_emc_value;
          this.groupedObjects[label].phos_emc_value = obj.phos_emc_value;
          this.groupedObjects[label].c = obj.c;
          this.groupedObjects[label].p = obj.p;
          this.groupedObjects[label].newNitr += obj.newNitr;
          this.groupedObjects[label].newPhos += obj.newPhos;
          this.groupedObjects[label].newSed += obj.newSed;
          this.groupedObjects[label].nitrReducPercent += obj.nitrReducPercent;
          this.groupedObjects[label].phosReducPercent += obj.phosReducPercent;
          this.groupedObjects[label].sedReducPercent += obj.sedReducPercent;
        });

        this.resourceUnits = Object.values(this.groupedObjects);

        this.resourceUnits.forEach((i) => {
          if (nonCrop.includes(i.label) == false) {
            if (i.nitr) {
              this.totalNitr += i.nitr;
            }
            if (i.phos) {
              this.totalPhos += i.phos;
            }
            if (i.sed) {
              this.totalSed += i.sed;
            }
            if (i.cAcres) {
              this.totalCropArea += i.cAcres;
            }
          }
        });
      } else if (this.layerSelection === '12-Digit Hydrologic Units') {
        this.hucUnits.forEach((obj) => {
          const label = obj.label;
          if (!this.groupedObjects[label]) {
            this.groupedObjects[label] = {
              label,
              cAcres: 0,
              nitr: 0,
              phos: 0,
              sed: 0,
              bmpSelect: [],
            };
          }
          this.groupedObjects[label].cAcres += obj.cAcres;
          this.groupedObjects[label].nitr += obj.nitr;
          this.groupedObjects[label].phos += obj.phos;
          this.groupedObjects[label].sed += obj.sed;
        });

        this.hucUnits = Object.values(this.groupedObjects);

        this.hucUnits.forEach((i) => {
          if (nonCrop.includes(i.label) == false) {
            if (i.nitr) {
              this.totalNitr += i.nitr;
              i.nitr = i.nitr.toFixed(2);
            }
            if (i.phos) {
              this.totalPhos += i.phos;
              i.phos = i.phos.toFixed(2);
            }
            if (i.sed) {
              this.totalSed += i.sed;
              i.sed = i.sed.toFixed(2);
            }
            if (i.cAcres) {
              this.totalCropArea += i.cAcres;
              console.log(i.cAcres);
              i.cAcres = i.cAcres.toFixed(2);
            }
          }
        });
      } else if (this.layerSelection === 'Catchments') {
        this.catchUnits.forEach((obj) => {
          const label = obj.label;
          if (!this.groupedObjects[label]) {
            this.groupedObjects[label] = {
              label,
              cAcres: 0,
              nitr: 0,
              phos: 0,
              sed: 0,
              bmpSelect: [],
            };
          }
          this.groupedObjects[label].cAcres += obj.cAcres;
          this.groupedObjects[label].nitr += obj.nitr;
          this.groupedObjects[label].phos += obj.phos;
          this.groupedObjects[label].sed += obj.sed;
        });

        this.catchUnits = Object.values(this.groupedObjects);

        this.catchUnits.forEach((i) => {
          if (nonCrop.includes(i.label) == false) {
            if (i.nitr) {
              this.totalNitr += i.nitr;
              i.nitr = i.nitr.toFixed(2);
            }
            if (i.phos) {
              this.totalPhos += i.phos;
              i.phos = i.phos.toFixed(2);
            }
            if (i.sed) {
              this.totalSed += i.sed;
              i.sed = i.sed.toFixed(2);
            }
            if (i.cAcres) {
              this.totalCropArea += i.cAcres;
              console.log(i.cAcres);
              i.cAcres = i.cAcres.toFixed(2);
            }
          }
        });
      } else if (this.layerSelection === 'Field Boundaries') {
        this.fieldUnits.forEach((obj) => {
          const label = obj.label;
          if (!this.groupedObjects[label]) {
            this.groupedObjects[label] = {
              label,
              cAcres: 0,
              nitr: 0,
              phos: 0,
              sed: 0,
              bmpSelect: [],
            };
          }
          this.groupedObjects[label].cAcres += obj.cAcres;
          this.groupedObjects[label].nitr += obj.nitr;
          this.groupedObjects[label].phos += obj.phos;
          this.groupedObjects[label].sed += obj.sed;
        });

        this.fieldUnits = Object.values(this.groupedObjects);

        this.fieldUnits.forEach((i) => {
          if (nonCrop.includes(i.label) == false) {
            if (i.nitr) {
              this.totalNitr += i.nitr;
              i.nitr = i.nitr.toFixed(2);
            }
            if (i.phos) {
              this.totalPhos += i.phos;
              i.phos = i.phos.toFixed(2);
            }
            if (i.sed) {
              this.totalSed += i.sed;
              i.sed = i.sed.toFixed(2);
            }
            if (i.cAcres) {
              this.totalCropArea += i.cAcres;
              console.log(i.cAcres);
              i.cAcres = i.cAcres.toFixed(2);
            }
          }
        });
      }
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
    bmpOptions() {
      this.bmpOptions.forEach((bmp) => {
        console.log(bmp);
      });
    },
    toggledOff() {},
    endLoading() {
      if (this.endLoading == true) {
        this.consolidateData();
        this.loadingVis = false;
        this.mngmtVis = true;
      }
    },
    areaChanged() {
      console.log(this.areaApplied);
      console.log(this.bmpAltered);
      this.lastBMPLabel = '';
      if (this.finalLayer === 'NRCS Resource Units') {
        this.bmpSelect.forEach((a, i) => {
          if (a.label === this.bmpAltered.label) {
            this.bmpSelect[i] = this.bmpAltered;
          }
        });

        this.buildNrcs([this.bmpSelect, this.lastCrop]);
      }
      // else if (this.finalLayer === '12-Digit Hydrologic Units') {

      // } else if (this.finalLayer === 'Catchments') {

      // } else if (this.finalLayer === 'Field Boundaries') {

      // }
    },
    bmpSelect() {
      this.bmpOptions.forEach((a) => {
        if (this.lastBMP.type == 'full') {
          a.disable = true;
        } else if (this.lastBMP.type == 'defined') {
          if (a.type == 'full' || a.type == 'defined') {
            a.disable = true;
          }
        } else if (
          this.lastBMP.type == 'exclusive' ||
          this.lastBMP.type == 'overlapping'
        ) {
          if (a.disable == true) {
            a.disable = true;
          } else if (a.disable == false) {
            a.disable == false;
          }
        }
      });

      this.lastBMP = {};
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
