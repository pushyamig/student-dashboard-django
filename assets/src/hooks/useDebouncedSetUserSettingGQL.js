import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import debounce from 'lodash.debounce'

const UPDATE_USER_SETTING = gql`
  mutation setUserDefaultSelection($input: UserDefaultSelectionInput!) {
    setUserDefaultSelection(data: $input) {
      userDefaultSelection {
        courseId,
        defaultViewType,
        defaultViewValue,
      }
    }
  }
`

const useDebouncedSetUserSettingGQL = () => {
  const [
    updateUserSetting,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(UPDATE_USER_SETTING)

  const debouncedUpdateUserSetting = debounce(updateUserSetting, 500, {
    leading: false,
    trailing: true
  })

  return [debouncedUpdateUserSetting, mutationLoading, mutationError]
}

export default useDebouncedSetUserSettingGQL
