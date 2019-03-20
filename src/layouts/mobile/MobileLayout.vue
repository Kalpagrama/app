<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
        <q-toolbar-title>
          Kalpagramma
        </q-toolbar-title>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white text-primary">
      <q-tabs no-caps active-color="primary" indicator-color="transparent" class="text-grey"
      v-model="tab">
          <q-tab name="images">
            <q-btn flat color="primary" :icon="'home'"></q-btn>
          </q-tab>
          <q-tab name="videos" label="Videos" />
          <q-tab name="articles" label="Articles" />
        </q-tabs>
    </q-footer>

  </q-layout>
</template>

<script>
import { openURL } from 'quasar';

export default {
  name: 'GuestMobileLayout',
  data() {
    return {
      tab: null,
    };
  },
  methods: {
    openURL,
  },
};
</script>

<style></style>
