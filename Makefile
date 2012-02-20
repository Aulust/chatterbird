PREFIX = .
DIST_DIR = ${PREFIX}/build
SRC_DIR = client

MQ = ${DIST_DIR}/chatterbird.js
MQ_MIN = ${DIST_DIR}/chatterbird.min.js

COMPILER = java -jar ${PREFIX}/vendor/compiler.jar
PARAMS = --compilation_level SIMPLE_OPTIMIZATIONS

BASE_FILES = ${SRC_DIR}/utils/json2.js\
	${SRC_DIR}/protocol.js\
	${SRC_DIR}/connection.js\
	${SRC_DIR}/core.js\
	${SRC_DIR}/socket.js

MODULES = ${SRC_DIR}/intro.js\
	${BASE_FILES}\
	${SRC_DIR}/outro.js

core: chatterbird min

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

chatterbird: ${MQ}

${MQ}: ${MODULES} | ${DIST_DIR}
	@@echo "Building" ${MQ}

	@@cat ${MODULES} > ${MQ};

min: chatterbird ${MQ_MIN}

${MQ_MIN}: ${MQ}
	${COMPILER} ${PARAMS} --js ${MQ} --js_output_file ${MQ_MIN}
