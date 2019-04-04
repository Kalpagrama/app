<template lang="pug">
    .q-pa-md
        q-page.text-center.bold.kp-auth
            h5.text-weight-bold.kp-auth__title.head-title Войти с помощью
            .q-pa-md.q-gutter-y-sm
                q-btn.full-width.btn-register.kp-auth__button(v-for="(button,ix) in globalAuth" :style='`background: ${button.color}`' :icon="button.icon" :href="button.url" elevated no-caps type="a" :key="'global_'+ix" text-color='white' :label='`${button.label}`')
                q-btn.full-width.btn-register.kp-auth__button(v-for="(button,ix) in localAuth" :style='`background: ${button.color}`' :icon="button.icon" :to="button.url" elevated no-caps type="a" :key="'loc_'+ix" text-color='white' :label='`${button.label}`')

</template>

<script>
    const GLOBAL_AUTH = [
        { id: 1, label: 'Google', icon: 'fab fa-google-plus-g', color: '#dd4b39', url: '' },
        { id: 2, label: 'Facebook', icon: 'fab fa-facebook', color: '#3b5998', url: '' },
        { id: 3, label: 'VK', icon: 'fab fa-vk', color: '#45668e', url: 'https://oauth.vk.com/authorize?client_id=6911684&display=mobile&redirect_uri=https://api.kalpagramma.com/auth/login/vk&scope=email&response_type=code&v=5.92' },
        { id: 4, label: 'Twitter', icon: 'fab fa-twitter-square', color: '#00aced', url: '' },
        { id: 5, label: 'Instagram', icon: 'fab fa-instagram', color: '#9E5396', url: '' },
        { id: 6, label: 'Yandex', icon: 'fab fa-yandex', color: '#EC514D', url: '' },
        { id: 8, label: 'Telegram Passport', icon: 'fab fa-telegram', color: '#51B3DE', url: '' },
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
                localAuth: LOCAL_AUTH,
            };
        },
        methods: {
        },
    };

</script>

<style lang='stylus'>
    .btn-register i {
        position: absolute;
        left: 4%;
    }
</style>
