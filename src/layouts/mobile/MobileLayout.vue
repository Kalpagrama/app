<template lang="pug">
  q-layout(view='lHh Lpr lFf')
    q-header.glossy(elevated='')
      q-toolbar-title Kalpagramma

    q-page-container
      router-view

    q-footer.bg-white.kp-menu_main(bordered)
        <q-btn v-for="(btn, ix) in BUTTONS" :key="ix" flat :color="buttonColor(btn)" :icon="btn.icon" size="lg" @click="click(btn)"/>
</template>

<script>
const BUTTONS = [
    { icon: 'home', path: '/home' },
    { icon: 'search', path: '/search' },
    { icon: 'add_circle_outline', path: '/create' },
    { icon: 'notifications', path: '/bell' },
    { icon: 'person', path: '/profile' },
];

export default {
  name: 'GuestMobileLayout',
  data() {
    return {
      btn: null,
      BUTTONS,
    };
  },
  computed: {},
  methods: {
      click(btn) {
          this.btn = btn;
          this.$router.push(btn.path);
      },
      buttonColor(btn) {
          return this.btn === btn ? 'primary' : 'black';
      },
  },
};
</script>

<style lang="stylus">
.kp-menu
    &_main
        display grid
        grid-template-columns 1fr 1fr 1fr 1fr 1fr
        align-items center
        justify-items center
</style>
