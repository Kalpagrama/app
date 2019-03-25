<template lang="pug">
    .q-pa-md
        q-page(class='text-center bold')
            h5 Войдите в систему
            p Чтобы продолжить работу пожалуйста войдите или зарегистрируйтесь
            .q-pa-md.q-gutter-sm
                q-btn(v-for="(button,ix) in buttons" :style='`background: ${button.color}`' :icon="button.icon" glossy elevated no-caps type="a" :href="button.url.prevent" :key="ix" text-color='white' :label='`Войти с помощью  ${button.label}`' class='full-width btn-register')
                    //q-tooltip Войти с помощью {{button.label}}
</template>

<script>
    const BUTTONS = [
        { id: 1, label: 'Google', icon: 'fab fa-google-plus-g', color: '#dd4b39', url: '' },
        { id: 2, label: 'Facebook', icon: 'fab fa-facebook', color: '#3b5998', url: '' },
        { id: 3, label: 'VK', icon: 'fab fa-vk', color: '#45668e', url: '' },
        { id: 4, label: 'Twitter', icon: 'fab fa-twitter-square', color: '#00aced', url: '' },
        { id: 5, label: 'Instagram', icon: 'fab fa-instagram', color: '#9E5396', url: '' },
        { id: 6, label: 'Yandex', icon: 'fab fa-yandex', color: '#EC514D', url: '' },
        { id: 7, label: 'SSO', icon: 'fas fa-hand-scissors', color: '#1886e5', url: '' },
        { id: 8, label: 'Telegram Passport', icon: 'fab fa-telegram', color: '#51B3DE', url: '' },
        { id: 9, label: 'Email', icon: 'mail', color: '#5b5b5b', url: '' },
        { id: 10, label: 'Номера телефона', icon: 'phone', color: '#5b5b5b', url: '' },
    ];

    export default {
        name: 'PageMobileRegistration',
        data() {
            return {
                button: null,
                buttons: BUTTONS,
            };
        },
        methods: {
            buttonColor(button) {
                return this.button === button ? 'primary' : 'black';
            },
        },
    };

</script>

<style>
    .btn-register i {
        position: absolute;
        left: 2%;
    }
</style>
