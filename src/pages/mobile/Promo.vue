<template lang="pug">
    q-page.text-center.bold.kp-promo
        .q-pa-md
            h5.text-weight-bold.kp-promo__title.head-title Кальпаграмма
            p.text-weight-regular Соцсеть нового поколения, где мы все выявляем суть явлений этого мира
        q-video.kp-promo__video(:src='videoUrl' class="kp-promo__video")
        .q-pa-md
            p.text-weight-regular Текст, дублирующий содержание ролика, основные понятия и термины
        .q-gutter-y-sm.full-height
            q-btn.kp-promo__button(size='10px' style="background: #7030A0; color: white; width: 220px;" to="/registration") Войти
</template>

<script>
    export default {
        name: 'PageMobilePromo',
        data() {
        return {
            btnKalpa: '#4C5492',
            videoUrl: 'https://www.youtube.com/embed/fV0wFR55XAs',
        };
    },
    methods: {},
    };

</script>

<style lang="stylus">
    .kp-promo {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .kp-promo__button {
        margin-bottom: 2%;
    }
</style>
