<template lang="pug">
    .kp-beads
        .kp-beads__bg
        bead.kp-beads__bead(v-for="(item,ix) in BEADS" :key="ix" :percent-fill="item.fill" :selected="selected === item" :text="ix+1"

        @click.native="select(item)")

</template>

<script>
// import { mapGetters } from 'vuex'
import Bead from './beads/Bead';

const BEADS = [
    { id: 1, fill: 50 },
    { id: 2, fill: 25 },
    { id: 3, fill: 0 },
    { id: 4, fill: 75 },
    { id: 5, fill: 100 },
    { id: 6, fill: 50 },
    { id: 7, fill: 15 },
    { id: 8, fill: 0 },
    { id: 9, fill: 20 },
    { id: 10, fill: 60 },
];

export default {
    name: 'Beads',
    components: {
        bead: Bead,
    },
    props: {},
    data() {
        return {
            BEADS,
            selected: null,
        };
    },
    computed: {},
    methods: {
        select(item) {
            this.selected = item;
        },
    },
};
</script>

<style lang="stylus">
    .kp-beads
        position relative
        display grid
        padding 8px
        grid-template-columns 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr
        width 100%
        border-top 1px solid silver

        &__bg
            content: ""
            position: absolute
            top: 50% - 3px
            left: 5vw
            right 5vw
            height: 3px
            background #3
        &__bead
            align-self center
            justify-self center
            text-align center
</style>
