<template lang="pug">
  q-layout(view='lHh Lpr lFf')
    q-header.bg-white.text-black(elevated='')
        q-toolbar
            q-btn.q-mr-sm(flat='', round='', dense='', icon='menu')
            q-toolbar-title Кальпаграмма
            q-btn(flat='', round='', dense='', icon='more_vert')
    q-page-container
      router-view
    q-footer.bg-white.kp-menu_main(bordered)
        q-btn(v-for="(btn, ix) in BUTTONS" :key="ix" flat :color="buttonColor(btn)" :icon="btn.icon" size="lg" @click="click(btn)")
        q-btn(v-for="(btn, ixs) in BUTTONSREG" :key="'reg_'+ixs" flat :color="buttonColor(btn)" :icon="btn.icon" size="md" @click="click(btn)" active-class="active")
</template>

<script>
const BUTTONS = [
    { icon: 'home', path: '/home' },
    { icon: 'search', path: '/search' },
    { icon: 'add_circle_outline', path: '/create' },
    { icon: 'notifications_none', path: '/bell' },
    { icon: 'person_outline', path: '/profile' },
];

const BUTTONSREG = [
    { icon: 'fas fa-sign-in-alt', path: '/auth/register' },
    { icon: 'fas fa-user-tag', path: '/promo' },
    { icon: 'settings', path: '/test' },
];

export default {
  name: 'GuestMobileLayout',
  data() {
    return {
      btn: null,
      BUTTONS,
      BUTTONSREG,
    };
  },
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
