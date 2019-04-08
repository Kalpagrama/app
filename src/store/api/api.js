export function newsApi ([from, limit, direction]) {
    const pagination = { from, limit, direction }

    return {
        query: gql`query($pagination: PaginationInput!, $preferWidth: Int!, $preferHeight: Int!) {
            newsFeed(pagination: $pagination){
                oid
                type
                name
                thumbUrl(preferWidth: $preferWidth, preferHeight:$preferHeight)
            }
        }`,
        variables: {
            pagination: pagination,
            preferWidth: 370,
            preferHeight: 420
        }
    }
}

export function objectFullApi(oids) {
    return {
        query: gql`query($oids: [OID!]!){
            objectsFull(oids: $oids){
                oid
                type
                name
                ...on Node{
                    rate
                    rateUser
                    viewed
                    chainCnt
                    hashTags{
                        type
                        name
                    }
                }
            }
        }`,
        variables: {
            oids,
        }
    }
}

export function isUserAuthorizedApi () {
    return {
        query: gql`query {
            query{
                userIsAuthorized
            }
        }`
    }
}

export function isUserConfirmedApi () {
    return {
        query: gql`query {
            userIsConfirmed
        }`
    }
}

export function listAuthActionsApi () {
    return {
        query: gql`query {
            AuthActions{
                action
                url
                params
            }
        }`
    }
}
