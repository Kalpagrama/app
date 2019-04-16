export function someApi ([from, limit, direction]) {
    const pagination = { from, limit, direction }

    return {
        query: gql`mutation($param: Int!) {
        }`,
        variables: {
            param: 0
        }
    }
}
