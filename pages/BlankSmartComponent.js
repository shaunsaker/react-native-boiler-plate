import React from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import styleConstants from "../assets/styleConstants";

export class BlankSmartComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    static get propTypes() {
        return {};
    }

    render() {
        return (
            <View style={styles.container}>
                <View />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {},
});

function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps)(Blank);