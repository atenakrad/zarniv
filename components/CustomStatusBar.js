import { StatusBar } from 'react-native';

import { themeColor5 } from '../theme/Color';

export default function CustomStatusBar() {

    return (
        <StatusBar barStyle={'dark-content'} backgroundColor={themeColor5.bgColor(1)} animated={true} StatusBarAnimation='fade' />
    )
}
