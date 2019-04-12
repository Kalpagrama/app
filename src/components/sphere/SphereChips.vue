<template lang="pug">
    .sphere-chips
        q-chip(v-for="(item, ix) in src" clickable :key="ix" @click="$emit('clicked', item.oid)")
            q-avatar
                img(:src='item.thumbUrl')
            span {{item.name || ' ???? ' }}
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'SphereChips',
        props: {
            parentOid: {
                type: [String, Boolean],
                default: '',
            }
        },
        data() {
            return {
                src: [],
            };
        },
        computed: {
            ...mapState('providers', { provider: state => state.sphere })
        },
        watch: {
            parentOid(newVal) {
                if (newVal) {
                    this.refresh();
                }
            }
        },
        methods: {
            refresh() {
                this.provider.related(this.parentOid).then((data) => {
                    this.src = [];
                    if (Array.isArray(data)) {
                        data.forEach(el => this.src.push(el));
                    }
                });
            },
        },
    }
</script>
