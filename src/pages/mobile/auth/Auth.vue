<template lang="pug">
    //- .q-pa-md
    q-page.text-center.bold.kp-auth.column.justify-center
        h5.kp-auth__title.head-title Войти с помощью
        .q-pa-md.q-gutter-y-sm
            q-btn.full-width.btn-register.kp-auth__button(v-for="(item,ix) in buttons" :key="ix"
            :style=`{background: item.color, height: '50px'}` :icon="item.icon" @click="open(item)" elevated no-caps type="a"
            text-color='white' :label='`${item.label}`')
</template>

<script>
    const GLOBAL_AUTH = [
        { id: 1, action: '', label: 'Google', icon: 'fab fa-google-plus-g', color: '#dd4b39', url: '' },
        { id: 2, action: '', label: 'Facebook', icon: 'fab fa-facebook', color: '#3b5998', url: '' },
        { id: 3, action: 'LOGIN_VK', label: 'VK', icon: 'fab fa-vk', color: '#45668e', url: 'https://oauth.vk.com/authorize?client_id=6911684&display=mobile&redirect_uri=https://api.kalpagramma.com/auth/login/VK&scope=email&response_type=code&v=5.92' },
        { id: 4, action: '', label: 'Twitter', icon: 'fab fa-twitter-square', color: '#00aced', url: '' },
        { id: 5, action: '', label: 'Instagram', icon: 'fab fa-instagram', color: '#9E5396', url: '' },
        { id: 6, action: '', label: 'Yandex', icon: 'fab fa-yandex', color: '#EC514D', url: '' },
        { id: 8, action: '', label: 'Telegram Passport', icon: 'fab fa-telegram', color: '#51B3DE', url: '' },
    ];
    const LOCAL_AUTH = [
        { id: 9, label: 'Email', icon: 'mail', color: '#5b5b5b', to: '/auth/login/email' },
        { id: 10, label: 'Номера телефона', icon: 'phone', color: 'green', to: '/auth/login/phone' },
    ];
    export default {
        name: 'PageMobileRegistration',
        data() {
            return {};
        },
        computed: {
            buttons() {
                const items = [...LOCAL_AUTH]; //  ...GLOBAL_AUTH];

                GLOBAL_AUTH.forEach(el => {
                    if (el.action) items.push(el);
                });

                return items;
            },
        },
        methods: {
            open(item) {
                if (item.url) {
                    // window.open(item.url, '_blank');
                    location.href = item.url;
                } else if (item.to) {
                    this.$router.push(item.to);
                }
            }
        },
    };

</script>

<style lang='stylus'>
    .btn-register i {
        position: absolute;
        left: 4%;
    }
</style>
