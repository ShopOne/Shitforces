import com.moowork.gradle.node.npm.NpmTask
import org.gradle.language.jvm.tasks.ProcessResources
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "2.5.7"
    id("io.spring.dependency-management") version "1.0.11.RELEASE"
    id("org.flywaydb.flyway") version "8.2.2"
    kotlin("jvm") version "1.6.10"
    kotlin("plugin.spring") version "1.6.10"
    kotlin("plugin.jpa") version "1.6.10"
    id("com.moowork.node") version "1.3.1"
    id("org.jlleitschuh.gradle.ktlint") version "10.2.0"
}

version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_11

tasks.withType<Jar> {
    manifest {
        attributes["Main-Class"] = "com.nazonazo_app.shit_forces.ShitforcesApplication"
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

tasks.compileKotlin {
    dependsOn("ktlintFormat")
    kotlinOptions {
        jvmTarget = "1.3.72"
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa:2.6.1")
    implementation("org.apache.logging.log4j:log4j-to-slf4j:2.15.0")
    implementation("org.apache.logging.log4j:log4j-api:2.16.0")
    implementation("org.springframework.boot:spring-boot-starter-data-rest:2.6.1")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf:2.6.1")
    implementation("org.springframework.boot:spring-boot-starter-web:2.6.1")
    implementation("org.springframework.boot:spring-boot-starter-web-services:2.6.1")
    implementation("org.springframework.boot:spring-boot-starter-webflux:2.6.1")
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions:1.1.5")
    implementation("org.jetbrains.kotlin:kotlin-reflect:1.6.10")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.6.10")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor:1.6.0-RC2")
    implementation("org.springframework.security:spring-security-web:5.6.0")
    implementation("com.google.code.gson:gson:2.8.9")
    implementation("javax.validation:validation-api:2.0.1.Final")
    implementation("org.apache.commons:commons-lang3:3.12.0")
    implementation("org.mybatis.spring.boot:mybatis-spring-boot-starter:2.2.0")
    implementation("org.flywaydb:flyway-core:8.2.2")
    developmentOnly("org.springframework.boot:spring-boot-devtools:2.6.1")
    runtimeOnly("org.postgresql:postgresql:42.3.1")
    testImplementation("io.mockk:mockk:1.12.1")
    testImplementation("org.springframework.boot:spring-boot-starter-test:2.6.1")
    testImplementation("io.projectreactor:reactor-test:3.4.13")
    testImplementation("org.junit.jupiter:junit-jupiter:5.8.2")
    testImplementation("org.assertj:assertj-core:3.21.0")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "11"
    }
}

task<NpmTask>("installNpm") {
    setExecOverrides(
        closureOf<ExecSpec> {
            this.workingDir("./frontend")
        }
    )
    setArgs(listOf("install"))
}
task<NpmTask>("buildReact") {
    val args = mutableListOf("run")
    val buildMode = System.getenv("BUILD_MODE") ?: "DEVELOPMENT"
    dependsOn("installNpm")
    setExecOverrides(
        closureOf<ExecSpec> {
            this.workingDir("./frontend")
        }
    )
    if (buildMode == "PRODUCTION") {
        args.add("prodbuild")
    } else {
        args.add("build")
    }
    setArgs(args)
}
val processResources by tasks.existing(ProcessResources::class)
processResources {
    var buildFront = true
    if (project.hasProperty("args")) {
        val args = project.properties["args"] as? String
        if (args?.split("""\s+""".toRegex())?.find { it == "--only-back-end" } != null) {
            buildFront = false
        }
    }
    if (buildFront) {
        dependsOn("buildReact")
    }
}
