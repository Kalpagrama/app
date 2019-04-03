<template lang="pug">
    q-page
        grain-list(:source="cards")
</template>

<style lang="stylus">

</style>

<script>
    import GrainList from '../../components/GrainList'

    export default {
        name: 'PageMobileHome',
        components: {
            'grain-list': GrainList
        },
        data () {
            return {
                cards: []
            }
        },
        beforeMount () {
            for (let i = 0; i < 20; i += 1) {
                this.cards.push(i)
            }
        }
    }
</script>
