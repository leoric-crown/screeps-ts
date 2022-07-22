#!/bin/bash

VALUE=${1}

NOTVALUE=$([[ ${VALUE} = "true" ]] && echo "false" || echo "true")

sed -i "s/module.exports = ${NOTVALUE}/module.exports = ${VALUE}/" ./src/utils/screeps-profiler.js
exit 0
