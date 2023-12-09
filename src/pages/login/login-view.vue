<template>
    <q-layout view="lHh Lpr lFf">
        <q-page-container>
            <q-page class="flex flex-center bg-login">
                <q-card class="q-pa-md shadow-2 card-login q-pb-xl"
                    style="border-radius: 18px; background-color: #173153; width: 350px;">
                    <q-card-section class="text-center">
                        <q-img src="../../assets/logo_serv-ma.png" style="height: 150px;">
                            <template v-slot:loading>
                                <q-spinner-gears color="white" />
                            </template>
                        </q-img>
                        <div class="text-h5 text-weight-bold lbl-login">Inicio de sesión</div>
                        <div>Accede con tu cuenta</div>
                    </q-card-section>
                    <q-card-section>
                        <q-input dense outlined label-color="grey-1" color="grey-1" bg-color="primary" v-model="email"
                            label="Correo electrónico"></q-input>
                        <q-input dense outlined label-color="grey-1" color="grey-1" bg-color="primary" class="q-mt-md"
                            v-model="password" type="password" label="Contraseña" @keyup.enter="login();"></q-input>
                    </q-card-section>
                    <q-card-section>
                        <q-btn style="border-radius: 8px;" color="cyan-8" rounded size="md" label="Iniciar Sesión" no-caps
                            @click="login(); userStore.increment();" class="full-width"></q-btn>
                        <!-- <span style="color: #eee;">{{ userStore.counter }}</span> -->
                    </q-card-section>
                </q-card>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script src="./index.js" />