<template>
  <header class="print-hide">
    <a
      target="_blank"
      href="https://freshwaternetwork.org/"
      style="text-decoration: none !important"
    >
      <span class="text-weight-thin text-white" style="cursor: pointer"
        ><span class="text-weight-thin"> Freshwater Network</span>
        <span class="text-weight-thin text-secondary"> </span>
        <span class="text-secondary text-subtitle1 text-weight-thin"
          >&nbsp;&nbsp;Louisiana Ag Conservation</span
        ></span
      >
      <!-- <div>
      <q-btn
        @click="showHelp = true"
        padding="none"
        color="white"
        flat
        icon="help"
      />
    </div> -->
    </a>
  </header>
</template>

<script>
export default {
  data() {
    return {
      step: 1,
      showHelp: true,
      userHideDialogOptionMeramac: false,
      showUserOption: true,
      persistent: true,
    };
  },
  mounted() {
    //localStorage.userHideDialogOptionMeramac = '';
    if (localStorage.userHideDialogOptionMeramac == 'true') {
      this.showHelp = false;
      this.showUserOption = false;
      this.persistent = false;
    }
  },
  methods: {
    setUserChoice() {
      if (this.userHideDialogOptionMeramac == true) {
        localStorage.userHideDialogOptionMeramac = 'true';
        this.showUserOption = false;
        this.persistent = false;
      }
    },
  },
};
// removed from .header //
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Are+You+Serious&family=Carattere&family=Cookie&family=Merienda&display=swap');
header {
  background: var(--q-primary);
  height: 50px;
  color: white;
  font-size: 22px;
  padding: 10px 20px;
  box-shadow: 0px 8px 8px -2px rgb(51 51 51 / 42%);
  border-bottom: 1px solid var(--q-primary);
  position: relative;
  z-index: 10;
  display: flex;
}

.storymap {
  background: #fff;
  height: 50px;
  color: #000000;
  font-size: 25px;
  padding: 10px 20px;
  box-shadow: 0px 8px 8px -2px rgb(51 51 51 / 42%);
  position: relative;
  z-index: 10;
  display: flex;
  font-family: 'Merienda', cursive;
}

.q-img__content {
  background-color: rgba(255, 255, 255, 0.8);
}

header span {
  flex: 1;
  width: 700px;
  overflow: hidden;
  white-space: wrap;
  text-overflow: ellipsis;
}

header button {
  font-size: 15px;
}

@media screen and (max-width: 700px) {
  header {
    background: var(--q-primary);
    height: 30px;
    color: #fff;
    font-size: 14px;
    padding: 5px 10px;
    box-shadow: 0px 8px 8px -2px rgb(51 51 51 / 42%);
    position: relative;
    z-index: 10;
    display: flex;
  }
  header button {
    font-size: 12px;
  }
}
</style>
