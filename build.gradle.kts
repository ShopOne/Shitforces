import com.moowork.gradle.node.npm.NpmTask
import org.gradle.language.jvm.tasks.ProcessResources
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "2.3.4.RELEASE"
    id("io.spring.dependency-management") version "1.0.10.RELEASE"
    id("org.flywaydb.flyway") version "5.2.4"
    kotlin("jvm") version "1.3.72"
    kotlin("plugin.spring") version "1.3.72"
    kotlin("plugin.jpa") version "1.3.72"
    id("com.moowork.node") version "1.3.1"
    id("org.jlleitschuh.gradle.ktlint") version "9.2.1"
}

version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_11

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
    implementation("org.apache.logging.log4j:log4j-api:2.15.0")
    implementation("org.springframework.boot:spring-boot-starter-data-rest")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-web-services")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
    implementation("org.springframework.security:spring-security-web:5.3.3.RELEASE")
    implementation("com.google.code.gson:gson:2.8.9")
    implementation("javax.validation:validation-api:2.0.1.Final")
    implementation("org.apache.commons:commons-lang3:3.4")
    implementation("org.mybatis.spring.boot:mybatis-spring-boot-starter:2.0.1")
    implementation("org.flywaydb:flyway-core")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    runtimeOnly("org.postgresql:postgresql")
    testImplementation("io.mockk:mockk:1.10.5")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.projectreactor:reactor-test")
    testImplementation("org.junit.jupiter:junit-jupiter:5.5.2")
    testImplementation("org.assertj:assertj-core:3.8.0")
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
    setExecOverrides(closureOf<ExecSpec> {
        this.workingDir("./frontend")
    })
    setArgs(listOf("install"))
}
task<NpmTask>("buildReact") {
    val args = mutableListOf("run")
    val buildMode = System.getenv("BUILD_MODE") ?: "DEVELOPMENT"
    dependsOn("installNpm")
    setExecOverrides(closureOf<ExecSpec> {
        this.workingDir("./frontend")
    })
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
