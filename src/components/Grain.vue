<template lang="pug">
    q-card.kp-grain
        q-item.kp-grain__header
            q-item-section.kp-avatar(avatar)
                q-avatar.kp-avatar__image
                    img(src='https://cdn.quasar-framework.org/img/avatar2.jpg')
            q-item-section
                q-item-label Маша Мимими
        .kp-grain__content
            img(:src='randomImage(0)')
            //q-video(src='https://www.youtube.com/embed/DxPF_SQLp78?rel=0&controls=0&showinfo=0')

        q-item
            q-item-section.text-center.text-capitalize {{ randomText() }}

        .kp-grain__content
            img(:src='randomImage(1)')


        q-item-section.kp-grain__footer
            q-chip(dense disable icon='remove_red_eye' size='10px' color='white') {{ randomViews() }}
            q-chip.text-center(dense disable icon='star_border' size='10px' color='white') {{ randomRate(ix) }}
            q-chip.text-right(dense disable icon='link' size='10px' color='white') {{ randomLinks() }}
</template>

<script>
    const IMAGES = [
        'https://cdn.quasar-framework.org/img/parallax1.jpg',
        'https://cdn.quasar-framework.org/img/parallax2.jpg',
        'https://images.unsplash.com/photo-1533591084922-7da563f75388',
        'https://images.unsplash.com/photo-1541174710317-c464dc175229',
        'https://images.unsplash.com/photo-1476820865390-c52aeebb9891',
        'https://images.unsplash.com/photo-1501236570302-906143a7c9f8',
    ];

    const TEXTS = [
        'Время', 'Победа', 'Здоровье', 'Вечность', 'Милосердие', 'Вера', 'Жизнь', 'Благоденствие', 'Защита',
    ];
    export default {
        name: 'Grain',
        props: {
            item: {
                type: Object,
                default: () => ({}),
            },
            ix: {
                type: Number,
                default: 0,
            },
        },
        data() {
            return {

            };
        },
        methods: {
            randomRate(ix) {
                if (ix % 5 === 0) return 'Так и есть';
                if (ix % 4 === 0) return 'Скорее так';
                if (ix % 3 === 0) return 'Может быть';
                if (ix % 2 === 0) return 'Скорее нет';
                return 'Точно нет';
            },
            randomViews() {
                return `${parseInt(Math.random() * 200, 0)}K`;
            },
            randomLinks() {
                return parseInt(Math.random() * 1000, 0);
            },
            randomImage(koef) {
                const ix = Math.floor(Math.random() * IMAGES.length + koef);
                return IMAGES[ix >= IMAGES.length ? 0 : ix];
            },
            randomText() {
                const ix = Math.floor(Math.random() * TEXTS.length);
                return TEXTS[ix];
            },
        },
    };
</script>

<style lang="stylus">
    .kp
        &-grain
            max-width 99vw
            margin 6px auto

            &__header
                padding 0 8px
                max-height 40px !important
                overflow hidden

            &__content
                display block
                min-height 56vw
                max-height 56vw

                & img
                    width 100%
                    height 56vw

            &__footer
                display grid
                grid-template-columns 1fr 1fr 1fr

        &-avatar
            min-width 40px
            max-width 40px
            margin-right 8px
            overflow hidden

            &__image
                width 28px
                height 28px

</style>
