<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
        <q-toolbar-title>
          Kalpagramma
        </q-toolbar-title>
    </q-header>

    <q-page-container>
      <q-page>
        Desktop version is not available now. Please install app on your smartphone.
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar';

export default {
  name: 'GuestDesktopLayout',
  data() {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
    };
  },
  methods: {
    openURL,
  },
};
</script>

<style>
</style>
