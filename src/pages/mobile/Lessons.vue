<template lang="pug">
    q-page.text-left.bold.kp-lessons
        .q-pa-md
            h5.text-weight-bold.head-title.text-center Обучение
            p.text-weight-regular.small-text Чтобы получать удовольствие от Кальпаграммы посмотри коротенький обучающий ролик. Это поможет тебе быстрее понять суть и начать делиться с другими своими смыслами
        q-video.kp-promo__video(:src='videoUrl')
        .text-center
            q-btn.q-mt-md.outline(size='10px' style="color: primary; color: black; width: 220px;" to="/home") Пропустить

</template>

<script>
    export default {
        name: 'PageMobilePromo',
        data() {
            return {
                videoUrl: 'https://www.youtube.com/embed/fV0wFR55XAs',
                visibleSkip: false,
            };
        },
    };
</script>

<style lang="stylus">
</style>
