<template lang="pug">
  q-layout(view='lHh Lpr lFf').window-height
    //- progress
    q-circular-progress(v-if="progress" indeterminate size="50px" color="blue" class="q-ma-md progress")
    //- left drawer
    q-drawer(v-model="show_left_drawer")
        .column.fit.bg-white.justify-center.items-center
            span Menu
    //- right drawer
    q-drawer(v-model="show_right_drawer" side="right")
        .column.fit.bg-white.justify-center.items-center
            span right drawer
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
    //- page
    //- TODO: add transitions
    q-page-container
        router-view
    //- footer
    q-footer(bordered).row.justify-between.bg-white.q-px-sm
      q-btn(v-for="(btn, ix) in buttons()" :key="ix" flat :color="buttonColor(btn)" :icon="btn.icon" size="lg" @click="click(btn)")
      //- q-btn(round flat dense icon="menu" size="lg" @click="show_right_drawer = true" color="black")
</template>

<script>
import AuthMixin from '../../pages/mobile/auth/AuthMixin'

const BUTTONS = [
  { icon: 'home', path: '/home' },
  { icon: 'search', path: '/search' },
  { icon: 'add_circle_outline', path: '/create' },
  { icon: 'notifications_none', path: '/bell' },
  { icon: 'person_outline', path: '/profile' }
];

const BUTTONSREG = [
  { icon: 'fas fa-sign-in-alt', path: '/auth/login' }
  // { icon: 'fas fa-user-tag', path: '/promo' },
  // { icon: 'settings', path: '/setting' },
  // { icon: 'door-open', path: '/logout' },
  // { icon: 'paw', path: '/sphere/ATdoe3tBItw=' } // тестовая иконка
];

export default {
  name: 'GuestMobileLayout',
  mixins: [AuthMixin],
  data() {
    return {
      btn: null,
      BUTTONS,
      BUTTONSREG,
      progress: false,
      show_left_drawer: false,
      show_right_drawer: false
    };
  },
  created() {
    this.$router.push('/home')
  },
  computed: {},
  methods: {
    buttons() {
      if (this.auth && this.auth.authorized) {
        return BUTTONS;
      }
      return BUTTONSREG;
    },
    isTitle() {
      return this.$route.path !== '/search'
    },
    isSearch() {
      return this.$route.path === '/search'
    },
    headerVisible() {
      return !(
        /\/view\//.test(this.$route.path) ||
        /\/sphere\//.test(this.$route.path) ||
        /\/create/.test(this.$route.path)
      );
    },
    click(btn) {
      this.btn = btn;

      if (btn.path === '/logout') {
        // todo logout
      }

      this.$router.push(btn.path)
    },
    buttonColor(btn) {
      return this.btn === btn ? 'primary' : 'black'
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>

<style lang="stylus">
$btn = 45px;
.kp-menu {
  &_main {
    display: grid;
    width: 100%;
    /* grid-template-columns 1fr 1fr 1fr 1fr 1fr */
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    align-items: center;
    justify-items: center;
  }
}
</style>
