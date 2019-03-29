<template lang="pug">
  q-layout(view='lHh Lpr lFf')
    q-header.bg-white.text-black(elevated='' v-show="headerVisible()")
        q-toolbar
            q-btn.q-mr-sm(flat='', round='', dense='', icon='menu')
            q-toolbar-title(v-if="isTitle()") Кальпаграмма
            q-toolbar-title(v-if="isSearch()")
                q-input.text-black(borderless standout  color="purple-12" v-model="search" size="sm")
                    template(v-slot:prepend)
                        q-icon(v-if="search === ''" name="search")
                        q-icon(v-else name="clear" class="cursor-pointer" @click="search = ''")

            q-btn(flat='', round='', dense='', icon='more_vert')
    q-page-container
      router-view

    q-footer.bg-white.kp-menu_main(bordered)
        q-btn(v-for="(btn, ix) in BUTTONS" :key="ix" flat :color="buttonColor(btn)" :icon="btn.icon" size="lg" @click="click(btn)")
        q-btn(v-for="(btn, ix) in BUTTONSREG" :key="'reg_'+ix" flat :color="buttonColor(btn)" :icon="btn.icon" size="md" @click="click(btn)" active-class="active")
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
    };
  },
  methods: {
      isTitle() {
          return this.$route.path !== '/search';
      },
      isSearch() {
          return this.$route.path === '/search';
      },
      headerVisible() {
          return !(/\/view\//.test(this.$route.path)
              || /\/sphere\//.test(this.$route.path)
              || /\/create/.test(this.$route.path)
          );
      },
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
