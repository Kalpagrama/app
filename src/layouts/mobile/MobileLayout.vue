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
            q-btn(v-if="isAuth" v-for="(btn, ix) in BUTTONS" :key="ix" flat :color="buttonColor(btn)" :icon="btn.icon" size="lg" @click="click(btn)")
            q-btn(v-if="isAuth" flat color="black" icon='exit_to_app' size="lg" @click="logOut")
            q-btn(v-for="(btn, ix) in BUTTONSREG" :key="'reg_'+ix" flat :color="buttonColor(btn)" :icon="btn.icon" size="lg" @click="click(btn)" active-class="active")
        q-circular-progress(v-if="progress" indeterminate size="50px" color="blue" class="q-ma-md progress")
</template>

<script>
    // import { Auth } from '../../store/auth-old';
    import * as store from '../../store/store'

    const BUTTONS = [
        { icon: 'home', path: '/home' },
        { icon: 'search', path: '/search' },
        { icon: 'add_circle_outline', path: '/create' },
        { icon: 'notifications_none', path: '/bell' },
        { icon: 'person_outline', path: '/profile' }
    ]

    const BUTTONSREG = [
        { icon: 'fas fa-sign-in-alt', path: '/auth/register' },
        { icon: 'fas fa-user-tag', path: '/promo' },
        { icon: 'settings', path: '/setting' }
    ]

    export default {
        name: 'GuestMobileLayout',
        data () {
            return {
                btn: null,
                BUTTONS,
                BUTTONSREG,
                progress: false
            }
        },
        methods: {
            isTitle () {
                return this.$route.path !== '/search'
            },
            isSearch () {
                return this.$route.path === '/search'
            },
            headerVisible () {
                return !(/\/view\//.test(this.$route.path) ||
                    /\/sphere\//.test(this.$route.path) ||
                    /\/create/.test(this.$route.path)
                )
            },
            click (btn) {
                this.btn = btn
                this.$router.push(btn.path)
                console.log(store.store.user.oid)
            },
            buttonColor (btn) {
                return this.btn === btn ? 'primary' : 'black'
            },
            logOut () {
                this.progress = true
                setTimeout(() => {
                    this.progress = false
                    store.store.isAuth = false
                    store.store.user.oid = null
                    this.$router.push('/promo')
                }, 2000)
            }
        },
        computed: {
            isAuth () {
                return true
            }
        },
        created () {
            this.$router.push('/home')
        }
    }
</script>

<style lang="stylus">
    .kp-menu
        &_main
            display grid
            grid-template-columns 1fr 1fr 1fr 1fr 1fr
            align-items center
            justify-items center
</style>
