PREFIX = .
DIST_DIR = ${PREFIX}/build
SRC_DIR = client
SOCKJS = http://cdn.sockjs.org/sockjs-0.3.js

MQ = ${DIST_DIR}/chatterbird.js
MQ_MIN = ${DIST_DIR}/chatterbird.min.js

COMPILER = java -jar ${PREFIX}/vendor/compiler.jar
PARAMS = --compilation_level SIMPLE_OPTIMIZATIONS

BASE_FILES = ${SRC_DIR}/core.js\
	${SRC_DIR}/socket.js

MODULES = ${DIST_DIR}/sockjs.js\
	${SRC_DIR}/intro.js\
	${BASE_FILES}\
	${SRC_DIR}/outro.js

core: chatterbird min

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

sockjs:
	curl ${SOCKJS} > ${DIST_DIR}/sockjs.js

chatterbird: ${MQ}

${MQ}: ${DIST_DIR} sockjs ${MODULES}
	@@echo "Building" ${MQ}

	@@cat ${MODULES} > ${MQ};

min: chatterbird ${MQ_MIN}

${MQ_MIN}: ${MQ}
	${COMPILER} ${PARAMS} --js ${MQ} --js_output_file ${MQ_MIN}
