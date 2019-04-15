<template lang="pug">
    .q-pa-md
        q-page.text-center.bold.kp-auth
            h5.text-weight-bold.kp-auth__title.head-title Войти с помощью
            .q-pa-md.q-gutter-y-sm
                q-btn.full-width.btn-register.kp-auth__button(v-for="(button,ix) in globalAuth" :style='`background: ${button.color}`' :icon="button.icon" :action="button.action" :href="button.url"  elevated no-caps type="a" :key="'global_'+ix" text-color='white' :label='`${button.label}`')
                q-btn.full-width.btn-register.kp-auth__button(v-for="(button,ix) in localAuth" :style='`background: ${button.color}`' :icon="button.icon" :to="button.url" elevated no-caps type="a" :key="'loc_'+ix" text-color='white' :label='`${button.label}`')
</template>

<script>
    import AuthProvider from '../../../../store/api/AuthProvider';

    const GLOBAL_AUTH = [
        { id: 1, action: '', label: 'Google', icon: 'fab fa-google-plus-g', color: '#dd4b39', url: '' },
        { id: 2, action: '', label: 'Facebook', icon: 'fab fa-facebook', color: '#3b5998', url: '' },
        { id: 3, action: 'LOGIN_VK', label: 'VK', icon: 'fab fa-vk', color: '#45668e', url: 'https://oauth.vk.com/authorize?client_id=6911684&display=mobile&redirect_uri=https://api.kalpagramma.com/auth/login/vk&scope=email&response_type=code&v=5.92' },
        { id: 4, action: '', label: 'Twitter', icon: 'fab fa-twitter-square', color: '#00aced', url: '' },
        { id: 5, action: '', label: 'Instagram', icon: 'fab fa-instagram', color: '#9E5396', url: '' },
        { id: 6, action: '', label: 'Yandex', icon: 'fab fa-yandex', color: '#EC514D', url: '' },
        { id: 8, action: '', label: 'Telegram Passport', icon: 'fab fa-telegram', color: '#51B3DE', url: '' },
    ];
    const LOCAL_AUTH = [
        { id: 9, label: 'Email', icon: 'mail', color: '#5b5b5b', url: '/auth/login' },
        { id: 10, label: 'Номера телефона', icon: 'phone', color: 'green', url: '/auth/register/phone' },
    ];
    export default {
        name: 'PageMobileRegistration',
        data() {
            return {
                globalAuth: GLOBAL_AUTH,
                localAuth: LOCAL_AUTH
            };
        },
        methods: {
          async onSubmit(e) {
                /* console.log(e.target.getAttribute('action'))
                const provider = new AuthProvider(this);
                await provider.login(e.target.getAttribute('action'))
                    .then((res) => {
                        e.target.setAttribute('href', res)
                    })
                    .catch((err) => {
                        console.log(err)
                    }) */

                const provider = new AuthProvider(this);
                await provider.login(e.target.getAttribute('action'))
                .then((res) => {
                    this.$router.push(res)
                })
                .catch((err) => {
                    console.log(err)
                })
            },
        },
        created() {
/*            const provider = new AuthProvider(this);
                this.globalAuth.forEach((item, idx) => {
                    provider.login(item.action)
                        .then((res) => {
                        this.linkGlobalAuth = res;
                        console.log(res)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }) */
        },
    };

</script>

<style lang='stylus'>
    .btn-register i {
        position: absolute;
        left: 4%;
    }
</style>
